---
layout: post
title: Ansible 2 - How to set the group dynamically in a playbook
comments: true
show-avatar: false
tags: [Ansible, host, groups]
---


Last Post we learnt about setting a selecting a single host dynamically via playbook.
In this post we will look at how ou can set groups dynamically (workaround that does the same job)

**Pre-Requisites:**
Ansible Version: 2.8.1

#### Code (Playbook)

{% raw %}
```yml
- hosts: all
  gather_facts: no
  vars_prompt:
    - name: "group"
      prompt: "please enter the target hostname from: {{ groups }}"
      private: no
  tasks:
    - add_host:
        name: "{{item}}"
        groups: chosen_host
      with_items: "{{groups[group]}}"

- hosts: chosen_host
  connection: local
  gather_facts: no
  tasks:
    - debug:
        msg: "This task will run on: {{inventory_hostname}}"
```
{% endraw %}
#### Inventory

We have one parent group "all" and it has 2 child groups called "group1" and "group2"

```yml
all:
  children:
    group1:
      hosts:
        host1:
        host2:
        host3:
    group2:
      hosts:
        host4:
        host5:
        host6:
```

#### Explanation

The first playbook uses the add_host module to add all the hosts to a "temporary" group (only exists during the playbooks run). We use ```with_items: "{{groups[group]}}"``` in order to select all the hosts from a specified group and assign it to the "chosen_host" group (specified in the "group" variable in the playbook prompt).

The second playbook simple executes the the task over the "chosen_host" group

**running the playbook with the input "all" (selects all hosts)**:

```bash
user@user:~/$ ansible-playbook -i hosts2 select_multiple_host.yml 

please enter the target hostname from: {'ungrouped': [], 'all': [u'host3', u'host2', u'host1', u'host6', u'host5', u'host4'], u'group1': [u'host3', u'host2', u'host1'], u'group2': [u'host6', u'host5', u'host4']}: all

PLAY [all] *****************************************************************************************************************************************************************************************************

TASK [add_host] ************************************************************************************************************************************************************************************************
changed: [host3] => (item=host3)
changed: [host3] => (item=host2)
changed: [host3] => (item=host1)
changed: [host3] => (item=host6)
changed: [host3] => (item=host5)
changed: [host3] => (item=host4)

PLAY [chosen_host] *********************************************************************************************************************************************************************************************

TASK [debug] ***************************************************************************************************************************************************************************************************
ok: [host3] => {
    "msg": "This task will run on: host3"
}
ok: [host2] => {
    "msg": "This task will run on: host2"
}
ok: [host1] => {
    "msg": "This task will run on: host1"
}
ok: [host6] => {
    "msg": "This task will run on: host6"
}
ok: [host5] => {
    "msg": "This task will run on: host5"
}
ok: [host4] => {
    "msg": "This task will run on: host4"
}

PLAY RECAP *****************************************************************************************************************************************************************************************************
host1                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host2                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host3                      : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host4                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host5                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host6                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

**running the playbook with the input "group1" (selects all host of group1)**:

```bash
user@user:~/$ ansible-playbook -i hosts2 select_multiple_host.yml 
please enter the target hostname from: {'ungrouped': [], 'all': [u'host3', u'host2', u'host1', u'host6', u'host5', u'host4'], u'group1': [u'host3', u'host2', u'host1'], u'group2': [u'host6', u'host5', u'host4']}: group1

PLAY [all] *****************************************************************************************************************************************************************************************************

TASK [add_host] ************************************************************************************************************************************************************************************************
changed: [host3] => (item=host3)
changed: [host3] => (item=host2)
changed: [host3] => (item=host1)

PLAY [chosen_host] *********************************************************************************************************************************************************************************************

TASK [debug] ***************************************************************************************************************************************************************************************************
ok: [host3] => {
    "msg": "This task will run on: host3"
}
ok: [host2] => {
    "msg": "This task will run on: host2"
}
ok: [host1] => {
    "msg": "This task will run on: host1"
}

PLAY RECAP *****************************************************************************************************************************************************************************************************
host1                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host2                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
host3                      : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```
