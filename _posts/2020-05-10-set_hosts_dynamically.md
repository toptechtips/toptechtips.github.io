---
layout: post
title: Ansible 2 - How to set the host dynamically in  a playbook
subtitle: A guide on how you can set your host dynamically so that you can re-use your playbook and avoid duplicate playbooks
comments: true
show-avatar: false
tags: [Ansible, host, groups]
---

Sometimes we might have a scenario where we want an ansible playbook's host to be set dynamically. 
We use the add_host module from ansible to do this: https://docs.ansible.com/ansible/latest/modules/add_host_module.html

**Pre-Requisites:**
Ansible Version: 2.8.1

<br/>

## Code (The playbook)

{% raw %}
```yml
- hosts: all
  gather_facts: no
  vars_prompt:
    - name: "host"
      prompt: "please enter the target hostname from: {{ ansible_play_hosts }}"
      private: no
  tasks:
    - add_host:
        name: "{{host}}"
        groups: chosen_host

- hosts: chosen_host
  connection: local
  gather_facts: no
  tasks:
    - debug:
        msg: "This task will run on: {{inventory_hostname}}"
```
{% endraw %}

<br/>

## Test Inventory

a simple inventory which has 1 group "all" that contains 3 hosts "host1", "host2" and "host3":

```yml
all:
  hosts:
    host1:
    host2:
    host3:
```

<br/>

## Explanation
We have 2 playbooks. The **first playbook** is responsible for creating a "temporary" group (only exists during the playbooks run time) and assigning a host to it. We prompt the use to enter a host name and is store in the ```host``` variable. We then add this host name to the "chosen_host" group.

Next we pass that "chosen_host" group to the net playbook which is responsible for actually running the task running


running the playbook:

```bash
user@user:~/$ ansible-playbook -i hosts select_single_host.yml 

please enter the target hostname from: [u'host3', u'host2', u'host1']: host1

PLAY [all] *****************************************************************************************************************************************************************************************************

TASK [add_host] ************************************************************************************************************************************************************************************************
changed: [host3]

PLAY [chosen_host] *********************************************************************************************************************************************************************************************

TASK [debug] ***************************************************************************************************************************************************************************************************
ok: [host1] => {
    "msg": "This task will run on: host1"
}

PLAY RECAP *****************************************************************************************************************************************************************************************************
host1                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

```
