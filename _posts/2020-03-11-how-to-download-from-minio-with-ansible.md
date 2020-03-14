---
layout: post
title: How to download and interface with MinIO using Ansible
comments: true
show-avatar: false
tags: [aws, s3, minio, ansible]
---

In this post, we look at how we can interface with MinIO and download a file from it.

Ansible has the aws_s3 module which does exactly what we need and can be used to interface with minio.

Example to get a file from minio:
```yaml
- name: download from minio
  aws_s3:
    s3_url: "{% raw %}{{m_host}}{% endraw %}"
    bucket: "{% raw %}{{m_bucket}}{% endraw %}"
    object: "{% raw %}{{m_object}}{% endraw %}"
    dest: "{% raw %}{{m_dest}}{% endraw %}"
    mode: get
    aws_access_key: "{% raw %}{{m_access_key}}{% endraw %}"
    aws_secret_key: "{% raw %}{{m_secret_key}}{% endraw %}"
```

**Important:** you're minio url might be https and therefore require SSL,
however, if you don't want to have to supply a cert, set the validate_certs 
attribute to: ```validate_certs: no```

**Top Tip #1:** if you specify a ***non-existent*** folder on the ```dest``` 
attribute, you will get a SSL error which is completely irrelevant to the 
actual error!

**Top Tip #2** you should encrypt your secret and access keys. Use Ansible 
Vault! [See this tutorial](/2020-03-04-how-to-encrypt-your-ansible-vars-with-ansible-vault)

Reagrds,

John