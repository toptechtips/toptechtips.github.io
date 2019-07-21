---
layout: post
title: How to parallelize your Ansible Tasks
subtitle: Using Ansible poll and async attributes to create async ansible tasks that can be parallelized
comments: true
show-avatar: false
tags: [ansible, ansible poll, ansible async_status, ansible parallelization, devops, software-development]
---

**Pre-Requisites:**
Ansible Version: 2.8.1

Some tasks take a long time (for example setting up a container) and when ran sequentially, can take even longer. After Running my ansible playbook on 2 CLIs (obviously with sligtly different inventories) in an attempt to try and run 2 tasks at the same time... I Succeeded in running 2 tasks at the same time.

_So I wondered if ansible already has some functionality to allow for parallelization._

### Ansible's Async Task Attribute (Skip this part if you just want to copy and paste the code)

Turn's out ansible's is able to **execute tasks asynchronously** using the the **poll** and **async** attribute

You can add the poll attribute to a class to specify how often the task should be "checked". You also need to add the async attribute to specify how long that task could possibly take. Based on my finding... if you don't add the async attribute, the task won't run asynchronously and the poll attribute will be pointless.


In this example, the command is to wait for 15 seconds, whilst we poll it every 5 seconds. After 15 seconds(after the first task is finised) , we will see the debug message "Result: ...." along with the result of the first task.

```yaml
---
- hosts: all
  tasks:
  - name: simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec
    command: /bin/sleep 15
    async: 45
    poll: 5

  - debug:
    msg: "Results: {{result}}"
```

In This next example, we set the async to 10.

```yaml
---
- hosts: all
  tasks:
  - name: simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec
    command: /bin/sleep 15
    async: 10
    poll: 5

  - debug:
    msg: "Results: {{result}}"
```

If we set the async attribute is too small, less than the time the task will actually take. We get an error:

```shell
...FAILED! => {"changed": false, "msg": "async task did not complete within the requested time - 10s"}
```

### Async + 0 poll = Parallelized Task

So If we enable Async on a task, and set the poll to 0... We "Firing and Forgetting" a task. If we apply this to multiple tasks, that's no different to running a bunch of tasks in parallel.

Now we uses loops (with_items) to iterate a task. But with async and poll, each time an item is iterated, the next item is immediately started.

```yaml
- hosts: localhost
  vars:
    list:
      - one
      - two
      - three
  tasks:
    - name: simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec
      command: /bin/sleep 5
      async: 10
      poll: 0
      register: result
      with_items: "{{list}}"

    - debug:
        msg: "Result: {{result}}"
```

Results in:

```shell
PLAY [localhost] *******************************************************************************************************************************************

TASK [Gathering Facts] *************************************************************************************************************************************
ok: [localhost]

TASK [simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec] **************************************************************************
changed: [localhost] => (item=one)
changed: [localhost] => (item=two)
changed: [localhost] => (item=three)

TASK [debug] ***********************************************************************************************************************************************
ok: [localhost] => {
    "msg": "Result: {'msg': u'All items completed', 'changed': True, 'results': [{'ansible_loop_var': u'item', u'ansible_job_id': u'873020374135.20241', 'failed': False, u'started': 1, 'changed': True, 'item': u'one', u'finished': 0, u'results_file': u'/home/user/.ansible_async/873020374135.20241'}, {'ansible_loop_var': u'item', u'ansible_job_id': u'333053411439.20265', 'failed': False, u'started': 1, 'changed': True, 'item': u'two', u'finished': 0, u'results_file': u'/home/user/.ansible_async/333053411439.20265'}, {'ansible_loop_var': u'item', u'ansible_job_id': u'243541103158.20289', 'failed': False, u'started': 1, 'changed': True, 'item': u'three', u'finished': 0, u'results_file': u'/home/user/.ansible_async/243541103158.20289'}]}"                                    
}

PLAY RECAP *************************************************************************************************************************************************
localhost                  : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```



### What if I wan't to wait until ALL my async'ed/parallelized tasks are finished?

Ansible has the **async_status** module for this.

In this next example, we will add the async_status module to our parallel task example from the last section to wait until all async tasks are finished. Not: The "retries" attribute is just the max number of retries for a task when it fails.

```yaml
---
- hosts: localhost
  vars:
    list:
      - one
      - two
      - three
  tasks:
    - name: simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec
      command: /bin/sleep 5
      async: 10
      poll: 0
      register: result
      with_items: "{{list}}"

    - debug:
        msg: "Result: {{result}}"

    - name: Check sync status
      async_status:
        jid: "{{ async_result_item.ansible_job_id }}"
      loop: "{{ result.results }}"
      loop_control:
        loop_var: "async_result_item"
      register: async_poll_results
      until: async_poll_results.finished
      retries: 300
```

Results in:

```shell
PLAY [localhost] *******************************************************************************************************************************************

TASK [Gathering Facts] *************************************************************************************************************************************
ok: [localhost]

TASK [simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec] **************************************************************************
changed: [localhost] => (item=one)
changed: [localhost] => (item=two)
changed: [localhost] => (item=three)

TASK [debug] ***********************************************************************************************************************************************
ok: [localhost] => {
    "msg": "Result: {'msg': u'All items completed', 'changed': True, 'results': [{'ansible_loop_var': u'item', u'ansible_job_id': u'292354444708.20526', 'failed': False, u'started': 1, 'changed': True, 'item': u'one', u'finished': 0, u'results_file': u'/home/user/.ansible_async/292354444708.20526'}, {'ansible_loop_var': u'item', u'ansible_job_id': u'662825029617.20550', 'failed': False, u'started': 1, 'changed': True, 'item': u'two', u'finished': 0, u'results_file': u'/home/user/.ansible_async/662825029617.20550'}, {'ansible_loop_var': u'item', u'ansible_job_id': u'984762370304.20574', 'failed': False, u'started': 1, 'changed': True, 'item': u'three', u'finished': 0, u'results_file': u'/home/user/.ansible_async/984762370304.20574'}]}"
}

TASK [Check sync status] ***********************************************************************************************************************************
FAILED - RETRYING: Check sync status (300 retries left).
changed: [localhost] => (item={'ansible_loop_var': u'item', u'ansible_job_id': u'292354444708.20526', 'item': u'one', u'started': 1, 'changed': True, 'failed': False, u'finished': 0, u'results_file': u'/home/user/.ansible_async/292354444708.20526'})                                                               
changed: [localhost] => (item={'ansible_loop_var': u'item', u'ansible_job_id': u'662825029617.20550', 'item': u'two', u'started': 1, 'changed': True, 'failed': False, u'finished': 0, u'results_file': u'/home/user/.ansible_async/662825029617.20550'})                                                               
changed: [localhost] => (item={'ansible_loop_var': u'item', u'ansible_job_id': u'984762370304.20574', 'item': u'three', u'started': 1, 'changed': True, 'failed': False, u'finished': 0, u'results_file': u'/home/user/.ansible_async/984762370304.20574'})                                                             

PLAY RECAP *************************************************************************************************************************************************
localhost                  : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```
