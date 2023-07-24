---
layout: post
title: Running Your Ansible Playbook and Tasks in Parallel and other strategies
comments: true
subtitle: A guide about running your ansible PLAYBOOKS in parallel and other playbook execution strategies. Along with more detailed execution strategies like run_once, throttle and forks
show-avatar: false
toc: true
tags: [ansible]
---


We look at how you can execute your Ansible **playbooks in parallel** as well as other playbook **execution strategies**. 

This guide focuses more on running your playbooks in parallel, However, **If** you are looking to add some *parallelism or asynchronous-ness* within your **TASKS** then [this](https://toptechtips.github.io/2019-07-09-ansible_run_playbooks_tasks_in_parallel/) is the guide for that.

<br/>

**Pre-requisites & Setup**
- I'm using ```ansible-core 2.14```
- Ansible Host is running Python 3 on Ubuntu
- Managed/remote host(s) is running Python 2.7 on Ubuntu

<br/>


## Can you run your ansible playbook in parallel?
According to [Ansible Docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_strategies.html), **by default, each playbook task** is ran on **each host** at the **same time**. The playbook **does not move** onto the next playbook **task** until **each host is done** with the current playbook task. 

So technically **each task** in our playbook is **running in parallel** across different hosts. 

>Note that by **default Ansible runs with 5 ```forks```** meaning, that it will **only run EACH playbook TASK on 5 hosts simultaneously** (in parallel). In other words, each playbook task will be executed in batches of 5 

![default](/img/ansible-parallel/default.png)

If you **don't want** a host to **wait for other hosts** to complete their tasks, you can use the ```free``` strategy which just **runs all tasks per host as fast** as possible - more on this in the sections below.

<br/>

### Ansible default behavior Example - executes playbook in parallel across different hosts

Here's an example, we have a playbook that:
- We target 2 hosts ```docker-server``` and ```dev```
- Has 2 tasks, both run a python script that runs for a random amount of time (1 - 10 seconds)
- Results are shown after each task
- You will notice by looking at the timestamps that task 1 for BOTH hosts has to be completed before task 2

{% raw %}

Note that in ```ansible.cfg``` I use ```callbacks_enabled = profile_tasks``` - This allows us to profile how long each task takes:
```ini
[defaults]
callbacks_enabled = profile_tasks
```

Playbook:

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: task 1
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_random.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 1 result
      ansible.builtin.debug:
        msg: "Task 1 Script result: {{ result.stdout_lines[0] }}"

    - name: task 2
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_random.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 2 result
      ansible.builtin.debug:
        msg: "Task 2 Script result: {{ result.stdout_lines[0] }}"
```

{% endraw %}

The outcome: 

|| Task 1 Time | Task 2 Time |
|----------------------------|
| host: docker-server | 0:00:10.587 (9s elapsed) | 0:00:18.779 (8s elapsed) |
| host: dev | 0:00:10.587 (10s elapsed) | 0:00:18.779 (4s elapsed) | 
| Total task time | **10s** | **8s** | 

Output: 

<details>
<summary>Output (Click to show)</summary> 

<br/>

{% highlight bash %}
TASK [task 1] **********************************************************************************************************************************
Sunday 02 July 2023  21:48:54 +0000 (0:00:00.020)       0:00:00.020 *********** 
changed: [docker-server]
changed: [dev]

TASK [task 1 result] ***************************************************************************************************************************
Sunday 02 July 2023  21:49:04 +0000 (0:00:10.567)       0:00:10.587 *********** 
ok: [docker-server] => {
    "msg": "Task 1 Script result: 9 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 1 Script result: 10 seconds elapsed"
}

TASK [task 2] **********************************************************************************************************************************
Sunday 02 July 2023  21:49:04 +0000 (0:00:00.068)       0:00:10.656 *********** 
changed: [dev]
changed: [docker-server]

TASK [task 2 result] ***************************************************************************************************************************
Sunday 02 July 2023  21:49:12 +0000 (0:00:08.122)       0:00:18.779 *********** 
ok: [docker-server] => {
    "msg": "Task 2 Script result: 8 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 2 Script result: 4 seconds elapsed"
}

PLAY RECAP *************************************************************************************************************************************
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Sunday 02 July 2023  21:49:13 +0000 (0:00:00.093)       0:00:18.873 *********** 
=============================================================================== 
task 1 --------------------------------------------------------------------------------------------------------------------------------- 10.57s
task 2 ---------------------------------------------------------------------------------------------------------------------------------- 8.12s
task 2 result --------------------------------------------------------------------------------------------------------------------------- 0.09s
task 1 result --------------------------------------------------------------------------------------------------------------------------- 0.07s


{% endhighlight %}

</details>

<br/>

## Ansible free strategy - All tasks in playbook executed without waiting for other hosts
As explained previously, using Ansible's ```strategy: free``` will **execute your playbook's task** on each host **without waiting for other hosts** to complete their task. 


![free](/img/ansible-parallel/free.png)

>Note: You can also set ```strategy = free``` in the ```ansible.cfg``` file if you want your playbooks to run using the "free" strategy by default

### Free strategy Example

Here's an example, we have a playbook that:
- We target 2 hosts ```docker-server``` and ```dev```
- Has 2 tasks, both run a python script that runs for a random amount of time (1 - 10 seconds)
- Results are shown after each task
- You will notice by looking at the timestamps that task 2 for each host will execute as soon as task 1 is finished for that host

{% raw %}

Playbook (Is the same as the last example, but with ```strategy: free```):

```yaml
- hosts: all
  gather_facts: false
  strategy: free
  tasks:
    - name: task 1
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_random.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 1 result
      ansible.builtin.debug:
        msg: "Task 1 Script result: {{ result.stdout_lines[0] }}"

    - name: task 2
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_random.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 2 result
      ansible.builtin.debug:
        msg: "Task 2 Script result: {{ result.stdout_lines[0] }}"
```

{% endraw %}

The outcome: 

|| Task 1 Time | Task 2 Time | Total Host Playbook Time
|------------------------------------------------------|
| host: docker-server | 0:00:04.418 (4s elapsed) | 0:00:13.506 (9s elapsed) | 13s
| host: dev | 0:00:01.597 (1s elapsed) | 0:00:05.690 (4s elapsed) | 5s


The Output:

<details>
<summary>Output (Click to show)</summary> 

<br/>

{% highlight bash %}
TASK [task 1] *********************************************************************************************************
changed: [dev]
Sunday 02 July 2023  22:27:09 +0000 (0:00:01.547)       0:00:01.573 *********** 

TASK [task 1 result] **************************************************************************************************
ok: [dev] => {
    "msg": "Task 1 Script result: 1 seconds elapsed"
}
Sunday 02 July 2023  22:27:09 +0000 (0:00:00.023)       0:00:01.597 *********** 

TASK [task 1] *********************************************************************************************************
changed: [docker-server]
Sunday 02 July 2023  22:27:12 +0000 (0:00:02.795)       0:00:04.393 *********** 

TASK [task 1 result] **************************************************************************************************
ok: [docker-server] => {
    "msg": "Task 1 Script result: 4 seconds elapsed"
}
Sunday 02 July 2023  22:27:12 +0000 (0:00:00.025)       0:00:04.418 *********** 

TASK [task 2] *********************************************************************************************************
changed: [dev]
Sunday 02 July 2023  22:27:13 +0000 (0:00:01.271)       0:00:05.690 *********** 

TASK [task 2 result] **************************************************************************************************
ok: [dev] => {
    "msg": "Task 2 Script result: 4 seconds elapsed"
}

TASK [task 2] *********************************************************************************************************
changed: [docker-server]
Sunday 02 July 2023  22:27:21 +0000 (0:00:07.815)       0:00:13.506 *********** 

TASK [task 2 result] **************************************************************************************************
ok: [docker-server] => {
    "msg": "Task 2 Script result: 9 seconds elapsed"
}

PLAY RECAP ************************************************************************************************************
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Sunday 02 July 2023  22:27:21 +0000 (0:00:00.038)       0:00:13.544 *********** 
=============================================================================== 
task 2 result -------------------------------------------------------------------------------------------------- 7.85s
task 2 --------------------------------------------------------------------------------------------------------- 4.07s
task 1 --------------------------------------------------------------------------------------------------------- 1.55s
task 1 result -------------------------------------------------------------------------------------------------- 0.05s


{% endhighlight %}

</details>

We can see that Task 2 for ```dev``` host finished at 0:00:05.690 seconds. Whilst Task 2 for ```docker-server``` finished at 0:00:13.506 seconds.


<br/>

## Ansible serial strategy - Limit playbook execution to a batch size
Sometimes you might want to **limit** the amount of **hosts/machines** that your **playbook runs on simultaneously**. 

For example, you might have a playbook that downloads some file from a server, but **only one machine can connect to the server at a time**, so you need the playbook to be executed on one machine/host at a time - You can use the ```serial``` strategy.

![serial](/img/ansible-parallel/serial.png)

### Serial Strategy Example

Here's an example, we have a playbook that:
- We target 2 hosts ```docker-server``` and ```dev```
- Has 2 tasks, both run a python script that runs for a FIXED amount of time (2 seconds)
- Results are shown after each task
- ```serial``` is set to 1, which means that our playbook is **only executed on one host at a time**

{% raw %}

Playbook:

```yaml
- hosts: all
  gather_facts: false
  serial: 1
  tasks:
    - name: task 1
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_fixed.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 1 result
      ansible.builtin.debug:
        msg: "Task 1 Script result: {{ result.stdout_lines[0] }}"

    - name: task 2
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_fixed.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 2 result
      ansible.builtin.debug:
        msg: "Task 2 Script result: {{ result.stdout_lines[0] }}"

```


{% endraw %}

The Outcome:

|| Task 1 Time | Task 2 Time | Total Host Playbook Time
|------------------------------------------------------|
| host: docker-server | 0:00:02.584 (2s elapsed) | 0:00:04.696 (2s elapsed) |4s
| host: dev | 0:00:07.228 (2s elapsed) | 0:00:09.355 (2s elapsed) | 4s

You can see how Task 1 & 2 is **first completed on** the host ```docker-server``` **before being completed** on the host ```dev```


<details>
<summary>Output (Click to show)</summary> 

<br/>

{% highlight bash %}
TASK [task 1] **********************************************************************************************************************
Monday 10 July 2023  18:12:08 +0000 (0:00:00.017)       0:00:00.017 *********** 
changed: [docker-server]

TASK [task 1 result] ***************************************************************************************************************
Monday 10 July 2023  18:12:10 +0000 (0:00:02.567)       0:00:02.584 *********** 
ok: [docker-server] => {
    "msg": "Task 1 Script result: 2 seconds elapsed"
}

TASK [task 2] **********************************************************************************************************************
Monday 10 July 2023  18:12:10 +0000 (0:00:00.024)       0:00:02.608 *********** 
changed: [docker-server]

TASK [task 2 result] ***************************************************************************************************************
Monday 10 July 2023  18:12:12 +0000 (0:00:02.087)       0:00:04.696 *********** 
ok: [docker-server] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}

PLAY [all] *************************************************************************************************************************

TASK [task 1] **********************************************************************************************************************
Monday 10 July 2023  18:12:12 +0000 (0:00:00.043)       0:00:04.739 *********** 
changed: [dev]

TASK [task 1 result] ***************************************************************************************************************
Monday 10 July 2023  18:12:15 +0000 (0:00:02.488)       0:00:07.228 *********** 
ok: [dev] => {
    "msg": "Task 1 Script result: 2 seconds elapsed"
}

TASK [task 2] **********************************************************************************************************************
Monday 10 July 2023  18:12:15 +0000 (0:00:00.023)       0:00:07.251 *********** 
changed: [dev]

TASK [task 2 result] ***************************************************************************************************************
Monday 10 July 2023  18:12:17 +0000 (0:00:02.103)       0:00:09.355 *********** 
ok: [dev] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}

PLAY RECAP *************************************************************************************************************************
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Monday 10 July 2023  18:12:17 +0000 (0:00:00.040)       0:00:09.395 *********** 
=============================================================================== 
task 1 ---------------------------------------------------------------------------------------------------------------------- 5.06s
task 2 ---------------------------------------------------------------------------------------------------------------------- 4.19s
task 2 result --------------------------------------------------------------------------------------------------------------- 0.08s
task 1 result --------------------------------------------------------------------------------------------------------------- 0.05s 

{% endhighlight %}


</details>


<br/>


## More refined execution strategies - forks, throttle & run_once
You can use ```forks```, ```throttle``` and ```run_once``` for some finer-grain control on how you execute your tasks in your playbooks.

<br/>

### Forks - Limit simultaneous hosts for each task
Ansible Forks allows you to set the max number of hosts that **EACH Playbook TASK** can run on simultaneously. 

> By default, Ansible uses forks = 5

You can set Ansible forks in the ```ansible.cfg```:

```ini
[defaults]
forks = 10
```

Or, via command line when executing your playbook:

```bash
ansible-playbook -f 1  -i inventory/all.yml playbooks/parallel/tasks-normal-fixed.yml 
```

**For example**:
1. If your playbook targets 30 hosts and forks = 5, each playbook tasks will run on host 1, 2, 3, 4, 5 simultaneously. Then it will run the same task on host 6, 7, 8, 9, 10 simultaneously and so on... 
2. Once its run the task on all 30 hosts, it then moves onto the next playbook task

In the diagram below, forks = 1. Each playbook task is ran on ONE host at a time.

![forks](/img/ansible-parallel/forks.png)

<br/>

#### Example Playbook using Ansible Forks = 1
Here is the example playbook for the diagram above (forks = 1).

Playbook:

{% raw %}
```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: task 1
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_fixed.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 1 result
      ansible.builtin.debug:
        msg: "Task 1 Script result: {{ result.stdout_lines[0] }}"

    - name: task 2
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_fixed.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 2 result
      ansible.builtin.debug:
        msg: "Task 2 Script result: {{ result.stdout_lines[0] }}"
```
{% endraw %}

The Outcome:

|| Task 1 Time | Task 2 Time |
|------------------------------------------------------|
| host: docker-server | 0:00:04.182 (2s elapsed) | 0:00:08.419 (2s elapsed) |
| host: dev | 0:00:04.182 (2s elapsed) | 0:00:08.419 (2s elapsed) |
| Total task time | 4s | 4s |

You can that because ```forks = 1``` each task is first executed on the ```docker-server``` host and then the ```dev``` host - we forced Ansible to run each task sequentially across each target host.  

<details>
<summary>Output (Click to show)</summary> 

<br/>



{% highlight bash %}
TASK [task 1] **********************************************************************************************************************
Tuesday 11 July 2023  13:40:10 +0000 (0:00:00.020)       0:00:00.020 ********** 
changed: [docker-server]
changed: [dev]

TASK [task 1 result] ***************************************************************************************************************
Tuesday 11 July 2023  13:40:14 +0000 (0:00:04.162)       0:00:04.182 ********** 
ok: [docker-server] => {
    "msg": "Task 1 Script result: 2 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 1 Script result: 2 seconds elapsed"
}

TASK [task 2] **********************************************************************************************************************
Tuesday 11 July 2023  13:40:14 +0000 (0:00:00.058)       0:00:04.241 ********** 
changed: [docker-server]
changed: [dev]

TASK [task 2 result] ***************************************************************************************************************
Tuesday 11 July 2023  13:40:18 +0000 (0:00:04.178)       0:00:08.419 ********** 
ok: [docker-server] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}

PLAY RECAP *************************************************************************************************************************
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Tuesday 11 July 2023  13:40:18 +0000 (0:00:00.074)       0:00:08.494 ********** 
=============================================================================== 
task 2 ---------------------------------------------------------------------------------------------------------------------- 4.18s
task 1 ---------------------------------------------------------------------------------------------------------------------- 4.16s
task 2 result --------------------------------------------------------------------------------------------------------------- 0.07s
task 1 result --------------------------------------------------------------------------------------------------------------- 0.06s
{% endhighlight %}


</details>

<br/>




### Throttle - Limiting a task's concurrency using the Ansible throttle keyword
Ansible's ```throttle``` keyword can be used to limit the max workers for a specific playbook's task (similar to ```forks``` and ```serial```).

![throttle](/img/ansible-parallel/throttle.png)

You can also apply the throttle keyword inside block tasks and at block-level:

```yaml
    - name: some task
      throttle: 1 # limits to 1 worker at a time at a time

    - block:
        - name: some block task
          throttle: 1 # limits this block's task to 1 worker at a time

      throttle: 1 # limits the whole block to 1 worker at a time
```

#### Example Playbook using Ansible Throttle = 1 

The Playbook - We set throttle = 1 for ONLY task 1

{% raw %}
```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: task 1
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_fixed.py
        executable: /usr/bin/python3 
      register: result
      no_log: true
      throttle: 1

    - name: task 1 result
      ansible.builtin.debug:
        msg: "Task 1 Script result: {{ result.stdout_lines[0] }}"

    - name: task 2
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_fixed.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 2 result
      ansible.builtin.debug:
        msg: "Task 2 Script result: {{ result.stdout_lines[0] }}"
```
{% endraw %}

The Outcome:

|| Task 1 Time | Task 2 Time |
|------------------------------------------------------|
| host: docker-server | 0:00:04.806 (2s elapsed) | 0:00:06.999 (2s elapsed) |
| host: dev | 0:00:04.806 (2s elapsed) | 0:00:06.999 (2s elapsed) |
| Total task time | 4s | 2s |

Since Task 1 is limited to 1 worker at a time, it took 4 seconds to complete. Whereas Task 2 ran in parallel (both workers) and took 2 seconds.

<details>
<summary>Output (Click to show)</summary> 

<br/>


{% highlight bash %}
TASK [task 1] **********************************************************************************************************************
Tuesday 11 July 2023  16:54:00 +0000 (0:00:00.019)       0:00:00.019 ********** 
changed: [docker-server]
changed: [dev]

TASK [task 1 result] ***************************************************************************************************************
Tuesday 11 July 2023  16:54:04 +0000 (0:00:04.786)       0:00:04.806 ********** 
ok: [docker-server] => {
    "msg": "Task 1 Script result: 2 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 1 Script result: 2 seconds elapsed"
}

TASK [task 2] **********************************************************************************************************************
Tuesday 11 July 2023  16:54:04 +0000 (0:00:00.052)       0:00:04.858 ********** 
changed: [docker-server]
changed: [dev]

TASK [task 2 result] ***************************************************************************************************************
Tuesday 11 July 2023  16:54:07 +0000 (0:00:02.140)       0:00:06.999 ********** 
ok: [docker-server] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}

PLAY RECAP *************************************************************************************************************************
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Tuesday 11 July 2023  16:54:07 +0000 (0:00:00.069)       0:00:07.068 ********** 
=============================================================================== 
task 1 ---------------------------------------------------------------------------------------------------------------------- 4.79s
task 2 ---------------------------------------------------------------------------------------------------------------------- 2.14s
task 2 result --------------------------------------------------------------------------------------------------------------- 0.07s
task 1 result --------------------------------------------------------------------------------------------------------------- 0.05s
{% endhighlight %}


</details>

<br/>


### Run_once - Task only runs on one host/worker
As its name implies - the Ansible ```run_once``` keyword means that a task only runs once, on the first host/worker. However, the result a ```run_once``` task is still shared to all the other hosts.

```yaml
    - name: some task
      run_once: true
```

If you want the task to **run once** but for a **specific host**, you can use the Ansible ```delegate_to``` keyword. But do be wary of some tasks that cannot be delegated - more info in [Ansible Docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_delegation.html#playbooks-delegation):

```yaml
    - name: some task
      run_once: true
      delegate_to: some_remote_host
```

![run-once](/img/ansible-parallel/run-once.png)

#### Example 1 - only task 1 is run once

- Task 1 and Task 2 execute a python script that will run for 1 - 10 seconds (random)
- Since only Task 1 is run once, Task 1 will take 4 seconds.
- When we print the results for Task 1 it will say that for both hosts, Task 1 took 4 seconds
- This is because Task 1 was only executed on host ```docker-server```, but the results are shared between host ```dev``` and host ```docker-server``` even though Task 1 did not run for host ```dev```

Playbook:

{% raw %}
```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: task 1
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_random.py
        executable: /usr/bin/python3 
      register: result
      no_log: true
      run_once: true

    - name: task 1 result
      ansible.builtin.debug:
        msg: "Task 1 Script result: {{ result.stdout_lines[0] }}"

    - name: task 2
      ansible.builtin.script:
        cmd: ../../lib/dummy_task_random.py
        executable: /usr/bin/python3 
      register: result
      no_log: true

    - name: task 2 result
      ansible.builtin.debug:
        msg: "Task 2 Script result: {{ result.stdout_lines[0] }}"

```
{% endraw %}

The Outcome:

|| Task 1 Time | Task 2 Time |
|------------------------------------------------------|
| host: docker-server | 0:00:04.100 (4s elapsed) | 0:00:13.286 (2s elapsed) |
| host: dev | N/A | 0:00:13.286 (9s elapsed) |
| Total task time | 4s | 9s |

In the task output below, you'll see that for task 1, only host ```docker-server``` was ```changed``` because we only ran task 1 on that host.

<details>
<summary>Output (Click to show)</summary> 

<br/>

{% highlight bash %}
TASK [task 1] **********************************************************************************************************************
Tuesday 11 July 2023  17:15:49 +0000 (0:00:00.021)       0:00:00.021 ********** 
changed: [docker-server]

TASK [task 1 result] ***************************************************************************************************************
Tuesday 11 July 2023  17:15:53 +0000 (0:00:04.078)       0:00:04.100 ********** 
ok: [dev] => {
    "msg": "Task 1 Script result: 4 seconds elapsed"
}
ok: [docker-server] => {
    "msg": "Task 1 Script result: 4 seconds elapsed"
}

TASK [task 2] **********************************************************************************************************************
Tuesday 11 July 2023  17:15:53 +0000 (0:00:00.050)       0:00:04.150 ********** 
changed: [docker-server]
changed: [dev]

TASK [task 2 result] ***************************************************************************************************************
Tuesday 11 July 2023  17:16:02 +0000 (0:00:09.135)       0:00:13.286 ********** 
ok: [docker-server] => {
    "msg": "Task 2 Script result: 2 seconds elapsed"
}
ok: [dev] => {
    "msg": "Task 2 Script result: 9 seconds elapsed"
}

PLAY RECAP *************************************************************************************************************************
dev                        : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Tuesday 11 July 2023  17:16:02 +0000 (0:00:00.072)       0:00:13.358 ********** 
=============================================================================== 
task 2 ---------------------------------------------------------------------------------------------------------------------- 9.14s
task 1 ---------------------------------------------------------------------------------------------------------------------- 4.08s
task 2 result --------------------------------------------------------------------------------------------------------------- 0.07s
task 1 result --------------------------------------------------------------------------------------------------------------- 0.05s
{% endhighlight %}


</details>

<br/>

## Run MULTIPLE, DIFFERENT playbooks on different hosts in PARALLEL (at the same time) 
So far we've looked at how we can run **ONE playbook in parallel across different hosts**.

But you might find yourself in a scenario where you have **multiple different playbooks** that run **sequentially** (e.g. by using ```include_playbook``` in your main playbook) and you want to **run** them in **parallel**.

For example, you might have an existing scenario like this:
![multi-playbook-sequential](/img/ansible-parallel/multi-playbook-sequential.png)

But you want to run your different playbooks like this:

![multi-playbook-parallel](/img/ansible-parallel/multi-playbook-parallel.png)

In short, it's like running 2 different playbooks as 2 different processes:

```bash
ansible-playbook playbook-1.yml &
ansible-playbook playbook-2.yml &
```

**Ansible does NOT have any "quick and easy" way of doing this**, and so we will use the [ansible-parallel](https://pypi.org/project/ansible-parallel/) pip package which will allow us to the equivalent of running multiple ```ansible-playbook``` commands

>NOTE: You could actually **refactor all your playbooks to use async** on all your tasks in order to **replicate this kind of behavior**, but we are **looking** for something **"quick and simple"** for this specific scenario. 
<br/>
<br/>
You **CANNOT use async when importing or including a playbook**, so you will end up having to **merge all your playbooks** and have them use ```async``` for parallelism whilst using ```blocks``` to structure them. Which can be a lot of work especially when converting a large process of sequential playbooks.

Here's the command I used to run 2 different playbooks in parallel:

```bash
ansible-parallel tasks-normal-fixed.yml tasks-normal-random.yml
```

The Output:

```bash
playbooks/parallel/tasks-normal-fixed.yml:  Done.
playbooks/parallel/tasks-normal-random.yml: Done.
# Playbook playbooks/parallel/tasks-normal-fixed.yml, ran in 6s
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   


# Playbook playbooks/parallel/tasks-normal-random.yml, ran in 14s
dev                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
docker-server              : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

<br/>

## Fastest way to execute ALL tasks across ALL hosts
If you want your Ansible playbook to **execute as fast as possible**, then you need to use ```async``` - [tutorial here](https://toptechtips.github.io/2019-07-09-ansible_run_playbooks_tasks_in_parallel/) to basically **"fire and forget"** all your tasks.

![fast-async](/img/ansible-parallel/fast-async.png)

<br/>

## Conclusion
There are many execution strategies when working with Ansible in order to help you achieve fast execution times whilst adding a good amount of control should you require it. 

I think it's helpful to understand all the different ways to control and execute your playbooks in order to automate your tasks in the most efficient way possible.

More info on playbook strategies in the [Ansible Docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_strategies.html)

