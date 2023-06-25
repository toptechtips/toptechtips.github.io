---
layout: post
title: Ansible Blocks Advance Guide - Simple & Complex Block Loops, Conditionals, Nested Blocks, Block Vars, delegate_to, retries, block with tags, Block Rescue & Always - Examples Included 
comments: true
subtitle: In this guide we look into many different use cases for Ansible blocks in your playbook. Includes examples on - block loops, block conditionals, nested blocks, using vars in blocks, using delegate_to with block and the usual Block rescue and always examples
show-avatar: false
toc: true
tags: [ansible]
---

**Pre-requisites & Setup**
- I'm using ```ansible-core 2.14```
- Ansible Host is running Python 3 and Managed/remote host is running Python 2.7
- Ansible Host & Managed/remote host is using Ubuntu

<br/>

## What is Ansible Block?
The goal of Ansible blocks is:
1. **Group** tasks together
2. Provide **error handling** (similar to exception handling / [try catch mechanism](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) that is commonly used in other programming languages)

An Ansible block uses the following sections - ```block```, ```resuce``` and ```always```

Here's an example of an Ansible block to demonstrate the different features of Ansible's ```block```:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
      - name: task 1
        ansible.builtin.debug:
          msg: "task 1"

      - name: fail at task 2
        ansible.builtin.fail:
          msg: "fail at task 2 (to be rescued)"
      
    rescue:
      - name: rescue task that runs if any task fails inside block
        ansible.builtin.debug:
          msg: "Task Rescued"
          
    always:
      - name: This task always runs at the end regardless of outcome
        ansible.builtin.debug:
          msg: "This task will always run at the end" 
```

The outcome as expected:
- task 1 runs
- task 2 fails
- task(s) in ```rescue``` section will execute
- finally, task(s) in ```always``` section will always execute at the end


```bash
TASK [task 1] ***********************************************************************************************
ok: [docker-server] => {
    "msg": "task 1"
}

TASK [fail at task 2] ***************************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "fail at task 2 (to be rescued)"}

TASK [rescue task that runs if any task fails inside block] *************************************************
ok: [docker-server] => {
    "msg": "Task Rescued"
}

TASK [This task always runs at the end regardless of outcome] ***********************************************
ok: [docker-server] => {
    "msg": "This task will always run at the end"
}
```

{% endraw %}

<br/>

## Important Notes when using Ansible Block
- Bad task definitions and unreachable hosts will **NOT trigger** the ```rescue``` block.
- As of now, you **cannot use loops with blocks** (but there is an **alternative solution** which we will talk about in later sections)
- A successful **block rescue reverts** any failed status back to a **success status**. Due to this, some other error handling techniques like [```max_fail_percentage``` or ```any_errors_fatal```](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_error_handling.html) will not be triggered as usual.

Other useful features of Ansible block is ```ansible_failed_task``` and ```ansible_failed_result``` which gives us more information about the task that failed inside a block. 

<br/>

## Error handling: Getting block task triggered the failure and its result
You can use the ```ansible_failed_task``` and ```ansible_failed_result``` to get information on the task that failed and the last result (of the failed task):

{% raw %}
```yaml
- hosts: docker-server 
  tasks:
  - block:
      - name: force fail task 
        ansible.builtin.fail:
          msg: "fail at task 2 (to be rescued)"
      
    rescue:
      - name: show failed task @ rescue
        ansible.builtin.debug:
          msg: "{{ ansible_failed_task }}"

      - name: show failed task's result @ rescue
        ansible.builtin.debug:
          msg: "{{ ansible_failed_result }}"
```

The Output:

```bash
TASK [fail at task 2] ***************************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "fail at task 2 (to be rescued)"}

TASK [show failed task @ rescue] ****************************************************************************
ok: [docker-server] => {
    "msg": {
        "action": "ansible.builtin.fail",
        "any_errors_fatal": false,
        "args": {
            "msg": "fail at task 2 (to be rescued)"
        },
        "async": 0,
        "async_val": 0,
        "become": false,
        "become_exe": null,
        "become_flags": null,
        "become_method": "sudo",
        "become_user": null,
        "changed_when": [],
        "check_mode": false,
        "collections": [],
        "connection": "ssh",
        "debugger": null,
        "delay": 5,
        "delegate_facts": null,
        "delegate_to": null,
        "diff": false,
        "environment": [
            {}
        ],
        "failed_when": [],
        "finalized": true,
        "ignore_errors": null,
        "ignore_unreachable": null,
        "loop": null,
        "loop_control": {
            "extended": null,
            "extended_allitems": true,
            "finalized": true,
            "index_var": null,
            "label": null,
            "loop_var": "item",
            "pause": 0.0,
            "squashed": false,
            "uuid": "0242ac11-0002-81ee-c2b3-00000000001c"
        },
        "loop_with": null,
        "module_defaults": [],
        "name": "fail at task 2",
        "no_log": null,
        "notify": null,
        "poll": 15,
        "port": null,
        "register": null,
        "remote_user": null,
        "retries": 3,
        "run_once": null,
        "squashed": true,
        "tags": [],
        "throttle": 0,
        "timeout": 0,
        "until": [],
        "uuid": "0242ac11-0002-81ee-c2b3-000000000005",
        "vars": {},
        "when": []
    }
}

TASK [show failed task's result @ rescue] *******************************************************************
ok: [docker-server] => {
    "msg": {
        "changed": false,
        "failed": true,
        "msg": "fail at task 2 (to be rescued)"
    }
}
```
{% endraw %}

<br/>

## Can you use multiple Ansible Blocks in a playbook?
Each block is like a single task, so you can use many blocks in one playbook:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
      - name: task 1, block 1
        ansible.builtin.debug:
          msg: "Task 1 Block 1"        

  - block:
      - name: task 1, block 2
        ansible.builtin.debug:
          msg: "Task 1 Block 2"

```
{% endraw %}

<br/>

## Force a fail / re-raise error in Ansible rescue block
When a block of tasks is "rescued", the overall task still counts as "success", but what if we want an overall task to fail after rescue? Use the Ansible [```fail``` module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/fail_module.html).

In this example, we have 2 tasks:
- If 1st task fails, it will be rescued and the block result is a success. 
- If the 2nd task fails, it's a critical fail - the task will still be rescued, but the final outcome of the block will be a fail!

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
    - name: Normal Task
      ansible.builtin.debug:
        msg: "Some normal task"

    - name: A Critical task 
      ansible.builtin.shell:
        cmd: "false"
      register: critical_task

    rescue:
    - name: A rescue task
      ansible.builtin.debug:
        msg: "Task rescued"
    
    - name: If critical_task IS the task that fails, the whole block is a flop
      ansible.builtin.fail:
        msg: "A critical task failed so overall block is fail"
      when: critical_task.failed is true
```
{% endraw %}

The Output:

```bash
TASK [Normal Task] ******************************************************************************************
ok: [docker-server] => {
    "msg": "Some normal task"
}

TASK [A Failing task] ***************************************************************************************
fatal: [docker-server]: FAILED! => {"changed": true, "cmd": "false", "delta": "0:00:00.002069", "end": "2023-06-21 22:16:36.585666", "msg": "non-zero return code", "rc": 1, "start": "2023-06-21 22:16:36.583597", "stderr": "", "stderr_lines": [], "stdout": "", "stdout_lines": []}

TASK [A rescue task] ****************************************************************************************
ok: [docker-server] => {
    "msg": "Task rescued"
}

TASK [If critical_task IS the task that fails, the whole block is a flop] ***********************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "A critical task failed so overall block is fail"}
```

<br/>

## Using include_tasks, Including multiple tasks and using the "when" conditional inside an Ansible Block
You can use the Ansible [```include_tasks``` module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/include_tasks_module.html) inside an Ansible ```block```.

And if you want to use include_tasks multiple times, just use ```loop```.

You can also use Ansible ```when``` conditionals inside a block as shown below: 

{% raw %}
```yaml
- hosts: docker-server
  vars:
    include_files: false
  tasks:
  - block:
    - ansible.builtin.include_tasks:
        file: "{{ item }}"
      loop:
        - included-task-1.yml
        - included-task-2.yml
      when: include_files is true
```
{% endraw %}

<br/>


### Affecting ansible when conditional at task level from inside a block
Modifying a variable inside a block task (using ```set_fact```) during run time will affect any conditional assigned to that variable.

In this example:
1. we set ```run_block``` to ```true``` which allows our block tasks to be executed.
2. However on the 2nd block task, we update ```run_block``` to be ```false```
3. This will affect our block's ```when: run_block is true``` conditional.
4. This causes the rest of our block's tasks to be skipped due to the conditional change

{% raw %}
```yaml
- hosts: docker-server
  vars:
    run_block: true
  tasks:
  - block:
    - ansible.builtin.debug:
        msg: "Task 1"

    - name: modify run_block var to affect conditional
      ansible.builtin.set_fact:
        run_block: false

    - ansible.builtin.debug:
        msg: "Task 2 - will not get run due to conditional change"

    when: run_block is true
```

The outcome as expected, is that task 2 gets skipped

```bash
TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": "Task 1"
}

TASK [modify run_block var to affect conditional] *****************************************************************
ok: [docker-server]

TASK [ansible.builtin.debug] **************************************************************************************
skipping: [docker-server]
```
{% endraw %}

<br/>


## Using delegate_to with Ansible block
You can use Ansible's ```delegate_to``` inside a block just fine. Just be wary that you can't use ```delegated_to``` with some tasks like ```include```, ```debug``` and ```add_host``` tasks.

Here's an example:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
    - name: a task to delegate to localhost
      ansible.builtin.shell:
        cmd: hostname -f
      register: result
      delegate_to: localhost

    - ansible.builtin.debug:
        msg: "{{ result.stdout }}"

    - name: A non-deleg ated normal task
      ansible.builtin.shell:
        cmd: hostname -f
      register: result

    - ansible.builtin.debug:
        msg: "{{ result.stdout }}"

```

Output: 

```bash
TASK [a task to delegate to localhost] **********************************************************************
changed: [docker-server -> localhost]

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "0baaa6d4d7fd"
}

TASK [A non-delegated normal task] **************************************************************************
changed: [docker-server]

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "user-VirtualBox"
}
```

{% endraw %}

<br/>

## Using tags with Ansible block
You can use [Ansible ```tags```](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tags.html) with block tasks just like you would in normal tasks:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
    - name: tagged task inside block
      ansible.builtin.debug:
        msg: "This block task will run be caused it is tagged"
      tags: test

    - name: normal task which wont run
      ansible.builtin.debug:
        msg: "This block task will not run because it is not tagged"

```

When we run it with the ```tags``` argument:

```bash
ansible-playbook -i inventory/all.yml playbooks/blocks/tags.yml --tags "test"
```

Only the tagged block task is ran:

```bash
TASK [tagged task inside block] *****************************************************************************
ok: [docker-server] => {
    "msg": "This block task will run be caused it is tagged"
}
```

{% endraw %}


<br/>

## Ansible Block vars
Using ```vars``` with Ansible blocks is just like using ```vars``` with normal tasks. If you specify a variable at the top level like:

{% raw %}

```yaml
- hosts: server
  vars:
    global_var: 123
  tasks:
  - some_task: <params>
    vars:
      task_var: ["hi"]
  
```

Then the variable will be available to all tasks in the playbook.

Whereas if you specify a var to a specific task, then only that task will have access to that variable. Since a ```block``` is treated similarly to a task, our task vars will be available to tasks within that block:

```yaml
- hosts: docker-server
  vars:
    global_var: 123
  tasks:
  - block:
    - ansible.builtin.debug:
        msg: "This is a Global Var: {{ global_var }}"
    
    - ansible.builtin.debug:
        msg: "This is a block-only/local var: {{ block_var }}"
    vars:
      block_var: [1,2,3]

  - name: We try to access the block only var, but will fail
    ansible.builtin.debug:
      msg: "try to access block-only/local var: {{ block_var }}"
```

In the output, the last task which tries to access the local_var defined to the block:

```bash
TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "This is a Global Var: 123"
}

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "This is a block-only/local var: [1, 2, 3]"
}

TASK [We try to access the block only var, but will fail] ***************************************************
fatal: [docker-server]: FAILED! => {"msg": "The task includes an option with an undefined variable. The error was: 'block_var' is undefined. 'block_var' is undefined\n\nThe error appears to be in '/workspaces/ansible/playbooks/blocks/vars.yml': line 14, column 5, but may\nbe elsewhere in the file depending on the exact syntax problem.\n\nThe offending line appears to be:\n\n\n  - name: We try to access the block only var, but will fail\n    ^ here\n"}
```

{% endraw %}

<br/>

## Ansible Nested blocks
You can nest blocks within other blocks. 

Personally **I don't recommend** this mainly because:
- It can make the playbook more **complicated**
- Your playbook can be **harder to read** and more **bug/typo-prone**
- If you do have to "nest" certain tasks, then **consider** using **roles**, making your **own modules** or **separating different blocks** into different **task files**

Having said this, here's an example of nested ```block```:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
      - name: outer task
        ansible.builtin.debug:
          msg: "outer task"
          
      - block:
        - name: inner task
          ansible.builtin.debug:
            msg: "inner task"
       
```

Output:

```bash
TASK [outer task] *************************************************************************************************
ok: [docker-server] => {
    "msg": "outer task"
}

TASK [inner task] *************************************************************************************************
ok: [docker-server] => {
    "msg": "inner task"
}
```

{% endraw %}


<br/>

### How to Re-raise errors within nested blocks
In this scenario we nest an inner block into a parent block. If there is a failed task on the child block we want it to be raised to the parent block. But we also want to perform a rescue task on the child block. This causes our child block's failed task to be reverted to success which means that the parent task will no longer pick up on the error from the child block's task.

The way to solve this is to use the Ansible ```fail``` module to force raise an error during the child block's rescue section. And also pass the ```ansible_failed_result``` variable from the child block to the parent block:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
      - name: outer task
        ansible.builtin.debug:
          msg: "outer task"

      - block:
        - name: inner task
          ansible.builtin.debug:
            msg: "inner task"

        - name: inner task that will fail
          ansible.builtin.shell:
            cmd: "false"

        rescue:
          - name: rescue inner tasks
            ansible.builtin.debug:
              msg: "rescue inner tasks"

          - name: pass ansible_failed_result to outer block's variable
            ansible.builtin.set_fact:
              error: "{{ ansible_failed_result }}"

          - name: after rescuing inner task, re-raise error for outer tasks
            ansible.builtin.fail:
              msg: "{{ ansible_failed_result }}"

    rescue:
      - name: rescue all task
        ansible.builtin.debug:
          msg: "{{ error }}"
        when: error is defined

    vars:
      error: # We use this var for passing errors from inner block to outer block
```

The outcome will be:
1. outer block's first task
2. inner block's first task
3. inner block will fail a task
4. inner block will rescue failed task
5. inner block's rescue will pass the ```ansible_failed_result``` or the failed task to the outer block's ```error``` var
6. inner block's rescue will force raise an error
7. outer block's rescue will trigger
8. outer block's first rescue task will trigger because the ```when``` condition is met

```bash
TASK [outer task] *************************************************************************************************
ok: [docker-server] => {
    "msg": "outer task"
}

TASK [inner task] *************************************************************************************************
ok: [docker-server] => {
    "msg": "inner task"
}

TASK [inner task that will fail] **********************************************************************************
fatal: [docker-server]: FAILED! => {"changed": true, "cmd": "false", "delta": "0:00:00.001959", "end": "2023-06-22 20:12:09.953381", "msg": "non-zero return code", "rc": 1, "start": "2023-06-22 20:12:09.951422", "stderr": "", "stderr_lines": [], "stdout": "", "stdout_lines": []}

TASK [rescue inner tasks] *****************************************************************************************
ok: [docker-server] => {
    "msg": "rescue inner tasks"
}

TASK [pass ansible_failed_result to outer block's variable] *******************************************************
ok: [docker-server]

TASK [after rescuing inner task, re-raise error for outer tasks] **************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": {"changed": true, "cmd": "false", "delta": "0:00:00.001959", "end": "2023-06-22 20:12:09.953381", "failed": true, "invocation": {"module_args": {"_raw_params": "false", "_uses_shell": true, "argv": null, "chdir": null, "creates": null, "executable": null, "removes": null, "stdin": null, "stdin_add_newline": true, "strip_empty_ends": true}}, "msg": "non-zero return code", "rc": 1, "start": "2023-06-22 20:12:09.951422", "stderr": "", "stderr_lines": [], "stdout": "", "stdout_lines": []}}

TASK [rescue all task when an error an error is defined] **********************************************************
ok: [docker-server] => {
    "msg": {
        "changed": true,
        "cmd": "false",
        "delta": "0:00:00.001959",
        "end": "2023-06-22 20:12:09.953381",
        "failed": true,
        "invocation": {
            "module_args": {
                "_raw_params": "false",
                "_uses_shell": true,
                "argv": null,
                "chdir": null,
                "creates": null,
                "executable": null,
                "removes": null,
                "stdin": null,
                "stdin_add_newline": true,
                "strip_empty_ends": true
            }
        },
        "msg": "non-zero return code",
        "rc": 1,
        "start": "2023-06-22 20:12:09.951422",
        "stderr": "",
        "stderr_lines": [],
        "stdout": "",
        "stdout_lines": []
    }
}
```

{% endraw %}

<br/>

## Ansible blocks with loops
You **cannot use** the ```loop``` keyword with an ansible block - [sources](). Otherwise, you will get errors like these:

```bash
ERROR! 'with_items' is not a valid attribute for a Block
ERROR! 'loop' is not a valid attribute for a Block
```

Since there is already an alternative solution/workaround, the devs deemed it unnecessary to implement the feature. We can use ```include_tasks``` instead which we will talk about in the next section. 

<br/>

### Using loops with include_tasks as an alternative solution
You put your block in a task file and use ```include_task``` and loop over that task in your main playbook using ```loop``` (Note that you can also use ```with_items```):

{% raw %}
task file to include (our block tasks): 
```yaml
- block:
    - name: output value variable + 10
      ansible.builtin.debug:
        msg: "10 + {{ value }} = {{ 10 + value }}"

    - name: output value variable - 10
      ansible.builtin.debug:
        msg: "{{ value }} - 10  = {{ value - 10 }}"
```

Our main playbook. We use ```include_tasks``` as a way of looping over our block:
```yaml
- hosts: docker-server
  tasks:
  - name: repeat block task with loop
    ansible.builtin.include_tasks: tasks.yml
    loop:
      - 1
      - 2
      - 3
```

The output: 

```bash
TASK [output value variable + 10] ***************************************************************************
ok: [docker-server] => {
    "msg": "10 + 1 = 11"
}

TASK [output value variable - 10] ***************************************************************************
ok: [docker-server] => {
    "msg": "1 - 10  = -9"
}

TASK [output value variable + 10] ***************************************************************************
ok: [docker-server] => {
    "msg": "10 + 2 = 12"
}

TASK [output value variable - 10] ***************************************************************************
ok: [docker-server] => {
    "msg": "2 - 10  = -8"
}

TASK [output value variable + 10] ***************************************************************************
ok: [docker-server] => {
    "msg": "10 + 3 = 13"
}

TASK [output value variable - 10] ***************************************************************************
ok: [docker-server] => {
    "msg": "3 - 10  = -7"
}
```

{% endraw %}

<br/>

### Skipping the rest of the block loops when a block fails (and rescues) in one of the iterations / using RESCUE in a block loop
One **problem scenario** for block loops using ```include_tasks``` might be that you have a ```block``` **AND** ```rescue```, if on one of the iterations/loops your block task fails and rescues, you might **not want** your loop to keep looping. 

Essentially, you might want to **skip** your **other loops of block tasks** when an **issue arises**. By default, looping ```include_tasks``` execute our loop unless we **force our block to fail** at ```rescue```, or we don't use a ```rescue``` 

The **solution** would be to have a variable that you use as a flag which we will use to skip the other blocks:

{% raw %}

the included block task:

```yaml
- block:
    - name: Force fail to simulate a failed task
      ansible.builtin.fail:
        msg: A force failed task
  rescue:
    - ansible.builtin.debug:
        msg: "A rescue task - an error has occured"
    
    - name: update task_error flag
      ansible.builtin.set_fact:
        task_error: true
        
  when: task_error is false # block wont get executed if an error occrus once
```

The playbook

```yaml
- hosts: docker-server
  vars:
    task_error: false
  tasks:
  
  - name: repeat block task with loop
    ansible.builtin.include_tasks: tasks.yml
    loop:
      - 1
      - 2
      - 3

```

The output as expected:
1. At the **first iteration** a block task fails
2. This sets the ```task_error``` to ```true```
3. Next two iterations will skip the task because the ```when``` conditional is NOT met

```bash
TASK [repeat block task with loop] **************************************************************************
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=1)
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=2)
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=3)

TASK [Force fail to simulate a failed task] *****************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "A force failed task"}

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "A rescue task - an error has occured"
}

TASK [update task_error flag] *******************************************************************************
ok: [docker-server]

TASK [Force fail to simulate a failed task] *****************************************************************
skipping: [docker-server]

TASK [Force fail to simulate a failed task] *****************************************************************
skipping: [docker-server]
```

{% endraw %}

<br/>

### Retry block loop tasks a certain number of times before failure / Using Ansible "retries" with a block task
For this scenario we want to **repeat** a block (a certain number of times) **when it fails**.
You **cannot** use ```retries``` with Ansible blocks, otherwise, you will get **this Error**:

```ERROR! 'retries' is not a valid attribute for a Block```

I also tried using ```include_tasks``` (include the block as a separate tasks file) with ```retries``` and you can't do that either.

What you can do however, is use a **counter variable** and ***some trickery*** (lol!) to emulate a **similar behavior to retries** (explanation below, after example): 

{% raw %}

The playbook:

```yaml
- hosts: docker-server
  vars:
    max_retries: 3
    retry_counter: 0
  tasks:
  - name: repeat block task with loop
    ansible.builtin.include_tasks: tasks.yml
    with_sequence: start=0 end={{ max_retries }}
```

The block tasks file to be included (tasks.yml):
```yaml
- block:
  - ansible.builtin.debug:
      msg: "Current amount of retries: {{ retry_counter }}"

  - ansible.builtin.fail:
      msg: Force a fail

  rescue:
  - ansible.builtin.set_fact:
      retry_counter: "{{ retry_counter | int + 1 }}"
  
  - ansible.builtin.fail:
      msg: "Exceeded max retry count of: {{ max_retries }}"
    when: (retry_counter | int >  max_retries | int)
```


**A. Explanation - The Playbook**
1. In the main playbook we use ```retry_counter``` var to keep track of our retries
2. And the ```max_retries``` to determine how many times our block task should be retried
3. We use ```with_sequence``` to loop our ```include_task``` as many times as we want to retry our block task (*tasks.yml*). This would be our equivalent to using ```retries```

**B. Explanation - The separate block tasks file**

1. In ```tasks.yml```, we have our usual block and rescue task
2. If a block task fails, ```rescue``` tasks gets executed
3. In the ```rescue``` section, the ```retry_counter``` variable is incremented
4. At the end of the ```rescue``` section, we check if ```retry_counter``` has exceeded the maximum set amount (via ```max_retries```), then we fail the block which will cause the ```include_tasks``` loop in the main playbook to stop - emulating the same scenario of a task failing should the block task reach its max retries.

>NOTE: Whilst this solution works, I would always recommend something simpler if possible.

The outcome:

```bash
TASK [repeat block task with loop] **************************************************************************
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=0)
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=1)
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=2)
included: /workspaces/ansible/playbooks/blocks/tasks.yml for docker-server => (item=3)

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "Current amount of retries: 0"
}

TASK [ansible.builtin.fail] *********************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "Force a fail"}

TASK [ansible.builtin.set_fact] *****************************************************************************
ok: [docker-server]

TASK [ansible.builtin.fail] *********************************************************************************
skipping: [docker-server]

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "Current amount of retries: 1"
}

TASK [ansible.builtin.fail] *********************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "Force a fail"}

TASK [ansible.builtin.set_fact] *****************************************************************************
ok: [docker-server]

TASK [ansible.builtin.fail] *********************************************************************************
skipping: [docker-server]

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "Current amount of retries: 2"
}

TASK [ansible.builtin.fail] *********************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "Force a fail"}

TASK [ansible.builtin.set_fact] *****************************************************************************
ok: [docker-server]

TASK [ansible.builtin.fail] *********************************************************************************
skipping: [docker-server]

TASK [ansible.builtin.debug] ********************************************************************************
ok: [docker-server] => {
    "msg": "Current amount of retries: 3"
}

TASK [ansible.builtin.fail] *********************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "Force a fail"}

TASK [ansible.builtin.set_fact] *****************************************************************************
ok: [docker-server]

TASK [ansible.builtin.fail] *********************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "Exceeded max retry count of: 3"}
```


{% endraw %}

<br/>

## Conclusion
All in all, blocks are very useful for enhancing your Ansible playbooks. Having said that though, If possible, I would always try to keep things as simple as possible!

<br/>