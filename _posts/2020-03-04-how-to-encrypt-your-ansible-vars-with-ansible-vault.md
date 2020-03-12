---
layout: post
title: How to encrypt your ansible secrets with ansible vault
comments: true
show-avatar: false
tags: [ansible, vault, encrypt, security, secrets]
---

Why should we encrypt our secrets/variables in ansible? Do you really want your *secret api keys* to be visible to others? 

If you're anything like me, you'd hard code all your sensitive API keys 
and passwords all on your Ansible inventory or even your playbooks or roles...Kidding.

Point is - How can I store and use sensitive data (passwords, API keys etc.)
securely? Introducing Ansible Vault! (It's really easy).

We will create a simple scenario where we will use a playbook to download a file from a minio bucket using the ansible aws_s3 module. This aws_s3 module will use some API keys which we will need to encrypt.

## Overview of Steps

1. Create a vault file and add secret variables
2. Create Playbook and Inventory
3. Encrypt vault file

## Create Vault File

Create a .yml file called ```vault.yml``` (you can call it whatever you want).
and put your secret variables in it.

vault.yml:

```yaml
# Obvsiouly in a real scenario we would not be using these values
minio_access_key: "xxxxxxxxxxxxx"
minio_secret_key: "xxxxxxxxxxxxx"
```

The `ansible-vault` command has many other options, for example - for decrpyting your vault file back into it's readable format, or editing your vault file.

## Create your Playbook and Inventory

For our inventory:

```ini
localhost ansible_connection=local

[all:vars]
minio_host='https://minio.testdomain.local' # minio host url
minio_bucket='test_bucket' # minio bucket
minio_object='/test_folder/test_file.zip' # file path to download
minio_dest='/home/user/test_file.zip' # file path to save download to
```

For our playbook:

```yaml
---
- hosts: localhost
  tasks:

  - name: include secrets
    include_vars: vault.yml
    no_log: True

  - name: download from minio
    aws_s3:
      s3_url: "{% raw %}{{minio_host}}{% endraw %}"
      bucket: "{% raw %}{{minio_bucket}}{% endraw %}"
      object: "{% raw %}{{minio_object}}{% endraw %}"
      dest: "{% raw %}{{minio_dest}}{% endraw %}"
      mode: get
      aws_access_key: "{% raw %}{{minio_access_key}}{% endraw %}"
      aws_secret_key: "{% raw %}{{minio_secret_key}}{% endraw %}"
      validate_certs: no # if our url is https, don't validate as we will not provide SSL Cert
```

We use our inventory for the `minio_host`, `minio_bucket`, `minio_object` and the `minio_dest` variable.

We then use the `include_vars` module to include vault secrests (minio_access_key and minio_secret_key).

**Top Tip:** when including your vault.yml secrets file, make sure to set the `no_log: True` attribute, because if you don't, you're secret variable will be shown when you run the playbook!

## Encrypt your vault key and run your playbook

Lastly, we need to encrypt your vault.yml in order to prevent anyone from seeing it's contents.

```bash
ansible-vault encrypt vault.yml
```

You will be asked to assign a password to our vault file. Remember this password as that is your only way of decrypting the file.

Now when you run your playbook, all you need to do is add the `--ask-vault-pass` option and enter your vault password

```bash
ansible-playbook -i inventory.yml playbook.yml --ask-vault-pass
```

You will get this kind of result (ignore the error at the bottom as we don't expect the module to work with the example variables):

```bash
pass
Vault password:

PLAY [localhost] ************************************************************************************************************

TASK [Gathering Facts] ******************************************************************************************************
ok: [localhost]

TASK [include secrets] ******************************************************************************************************
ok: [localhost]

TASK [download from minio] **************************************************************************************************
An exception occurred during task execution. To see the full traceback, use -vvv. The error was: EndpointConnectionError: Could not connect to the endpoint URL: "https://minio.testdomain.local/test_bucket"
fatal: [localhost]: FAILED! => {"boto3_version": "1.12.17", "botocore_version": "1.15.17", "changed": false, "msg": "Invalid endpoint provided: Could not connect to the endpoint URL: \"https://minio.testdomain.local/test_bucket\""}

PLAY RECAP ******************************************************************************************************************
localhost                  : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
```

## Bonus: Running this taks on AWX

What if you wan't to run this playbook in AWX or Ansible Tower?

Worry not, it's really easy. Just setup your task template as you would normally do.

Then **all you have to do** is setup a vault credential and assign it to your job_template. It's that easy.


Regards, 

John