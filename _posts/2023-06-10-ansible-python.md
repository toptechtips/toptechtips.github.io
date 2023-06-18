---
layout: post
title: Working with Python scripts in Ansible - with examples
comments: true
subtitle: This guide explores that different use cases you might run into when working with python in Ansible
show-avatar: false
toc: true
tags: [ansible, python]
---

In this article we look at:
- Different methods of **running your python script** in Ansible
- **Passing parameters** to the python script that you run
- Dealing with and **using the output** of your python script
- How to **run** your python script for in **different environments**


**Pre-requisites & Setup**
- I'm using ```ansible-core 2.14```
- Ansible Host is running Python 3 and Managed/remote host is running Python 2.7
- Ansible Host & Managed/remote host is using Ubuntu

<br/>

## How to run your python script in Ansible

There are **multiple ways** you can run your python script on Ansible, using the ```script```, ```command```, ```shell``` and ```raw``` modules. They are all slightly different and **will suit different use cases**.

Each of the modules have their own purposes. For our **purpose** which is **running a python script**, I think that the ansible **```script``` module** is probably the **best fit**.
 
<br/>

### Differences between Ansible Script, Shell, Command and Raw modules

{% raw %} 

```script``` module:
- It **copies your local** python script (from the Ansible controller host) to the remote/managed host and **executes it remotely**.
- This module is **best** for running scripts that are **stored on** your playbook

```shell``` module:
- Executes command(s) using the **default shell environment** of the remote host, just like you would run a command on the shell terminal of that remote machine
- Useful for running commands that require **shell-specific features** (e.g. having access to variables like ```$HOSTNAME``` and operations like ```"*"```, ```"<"```, ```">"```, ```"|"```, ```";"``` and ```"&"```)
- Better used for **executing simple commands** or even lines of commands
- Can run into **security risks** - It's important to **validate and sanitize user inputs** to prevent command **injection attacks**.

```command``` module: 
- Executes commands on the remote host **without involving the shell**
- Has a similar use case to shell, but is the **secure alternative** 
- you **won't** be able to use **shell-like features and syntax**

```raw``` module:
- Executes command(s) direct on remote host **without going through the module subsystem**
- Use this with **caution** as it **bypasses** Ansible's **built-in safety features**
- Useful when you need **maximum flexibility of the commands** you want to use
- Some useful use cases include **installing python in a remote host** that does not have python already installed or even **speaking to remote hosts like routers** which will not have python installed.

{% endraw %}

<br/>

### Using Ansible script module to run python scripts
Quite straight forward right?

{% raw %}

```yaml
- hosts: docker-server
  tasks:

  # Example 1 - Script Module

  - name: Execute Python Script using the script module
    ansible.builtin.script:
      cmd: ../../lib/example.py 
      executable: /usr/bin/python3
    register: result

  - debug:
      msg: "{{ result }}"
```

{% endraw %}

<br/>


### Using Ansible shell module to run python scripts
>More focused on running commands on shell so if you need to run a script the script needs to be inside the system already or use the ansible copy module to copy your local python script to the remote host

{% raw %}

```yaml
  - name: Copy local python script copy to remote
    ansible.builtin.copy:
      src: ../../lib/example.py
      dest: /home/user/projects/example.py

  - name: Execute Python Script using the shell module
    ansible.builtin.shell:
      cmd: python3 /home/user/projects/example.py
    register: result

  - debug:
      msg: "{{ result }}"
```

{% endraw %}

<br/>

### Using Ansible command module to run python scripts
>Same thing as the shell module, requires me to first copy my local python script to the remote host before executing it
{% raw %}

```yaml
  - name: Copy local python script copy to remote
    ansible.builtin.copy:
      src: ../../lib/example.py
      dest: /home/user/projects/example.py

  - name: Execute Python Script using the command module
    ansible.builtin.command:
      cmd: python3 /home/user/projects/example.py
    register: result

  - debug:
      msg: "{{ result }}"
```

{% endraw %}

<br/>

#### Using command's stdin parameter to run a python command inline
Just a side note, you can run inline python - Although I don't see why you'd want to do this, but sharing because it's cool! 
{% raw %}

```yaml
  - name: Execute Inline Python script using the command module
    ansible.builtin.command:
      cmd: python3
      stdin: |
        print("Hello")
    register: result

  - debug:
      msg: "{{ result }}"
```

{% endraw %}

<br/>

### Using Ansible raw module to run python script
>Same thing as the command module, requires me to first copy my local python script to the remote host before executing it
{% raw %}

```yaml
  - name: Copy local python script copy to remote
    ansible.builtin.copy:
      src: ../../lib/example.py
      dest: /home/user/projects/example.py

  - name: Execute Python Script using the raw module
    ansible.builtin.raw: python3 /home/user/projects/example.py
    register: result

  - debug:
      msg: "{{ result }}"

```

{% endraw %}

<br/>


## Running your python script locally
There are 2 ways to run your python script locally - setting ```hosts: localhost``` and ```connection: local``` OR using ```delegate_to: localhost``` to delegate the task to run locally. 

### Run ansible playbook locally using the hosts and connection parameters
{% raw %}
```yaml
- hosts: localhost
  connection: local
  tasks:
  - name: run python script locally (Using connection local)
    ansible.builtin.script:
      cmd: ../../lib/example.py
      executable: /usr/bin/python3
    register: result
  
  - ansible.builtin.debug:
      msg: "{{ result }}"
```
{% endraw %}

Note that you can also specify a playbook to run locally using the ```connection``` parameter when you run your ansible task:

```bash
ansible-playbook playbook.yml --connection=local
```

<br/>


### Run a specific ansible task locally using delegate_to
You can use Ansible's [delegate_to](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_delegation.html) to **run a specific Ansible task locally**, but just be aware that there **some tasks that cannot be delegated** as they need to be **always ran on the ansible host controller** e.g. ```include```, ```add_host``` and ```debug``` cannot be delegated.

The **benefit** of using Ansible's [delegate_to](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_delegation.html) is that you it **adds more flexibility** to your playbooks/tasks.

{% raw %}

In this example we **run a local task** (using ```delegate_to```) and a **remote task** to compare the outputs of the python script.

```yaml
- hosts: docker-server
  tasks:
  - name: run pyhon script locally (Using delegate_to)
    ansible.builtin.script:
      cmd: ../../lib/example.py
      executable: /usr/bin/python3
    register: result2
    delegate_to: localhost
  
  - ansible.builtin.debug:
      msg: "{{ result2 }}"

  - name: run python script remotely
    ansible.builtin.script:
      cmd: ../../lib/example.py
      executable: /usr/bin/python3
    register: result3
  
  - ansible.builtin.debug:
      msg: "{{ result3 }}"
```

NOTE: the ```example.py``` python script **prints the IP of the machine that the script is run on**.

The Result - You can see how the IPs printed out differ between the local and remote task:

```bash
TASK [run pyhon script locally (Using delegate_to)] ***************************************************************
changed: [docker-server -> localhost]

TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": {
        "changed": true,
        "failed": false,
        "rc": 0,
        "stderr": "",
        "stderr_lines": [],
        "stdout": "Hello\n172.17.0.2\n",
        "stdout_lines": [
            "Hello",
            "172.17.0.2"
        ]
    }
}

TASK [run python script remotely] *********************************************************************************
changed: [docker-server]

TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": {
        "changed": true,
        "failed": false,
        "rc": 0,
        "stderr": "Shared connection to 192.168.0.250 closed.\r\n",
        "stderr_lines": [
            "Shared connection to 192.168.0.250 closed."
        ],
        "stdout": "Hello\r\n127.0.1.1\r\n",
        "stdout_lines": [
            "Hello",
            "127.0.1.1"
        ]
    }
}

```


{% endraw %}


<br/>
 
## Running your python script in the background whilst other ansible tasks run (Running an asynchronous task)
You can **run an ansible task whilst running other ansbile tasks within the same playbook**. Essentially, what we want is to create an **asynchronous ansible task** so that our task can run "in the background" whilst other tasks run.

>NOTE that ```script``` module does not work with async, so we will use the ```command``` module to run our python script

In this example:
1. We run our python script first, in async mode (which runs for 10 seconds) 
2. Whilst our python script is running we run another task
3. Once our python script is finished, we grab and display the output
4. After the python script has finished we run another task 

{% raw %}

```yaml
- hosts: docker-server
  tasks:

  - name: Copy local python script copy to remote
    ansible.builtin.copy:
      src: ../../lib/background-task.py 
      dest: /home/user/projects/background-task.py 

  - name: run python script asynchronously (runs for 10 seconds)
    ansible.builtin.command:
      cmd: python /home/user/projects/background-task.py 
    register: async_task
    async: 60
    poll: 0

  - name: Some other task to run DURING asynchronous task
    ansible.builtin.debug:
      msg: "Some Other task to execute DURING Async Task"

  - name: Get output of asynchronous task when finished
    ansible.builtin.async_status:
      jid: '{{ async_task.ansible_job_id }}'
    register: async_task_result
    until: async_task_result.finished
    retries: 10

  - name: Output result of asynchronous task when finished
    ansible.builtin.debug:
      msg: "{{ async_task_result }}"

  - name: Task that runs AFTER asynchronous task
    ansible.builtin.debug:
      msg: "Task ran AFTER Async Task"
```

This results in:

```bash
PLAY [docker-server] **********************************************************************************************

TASK [Gathering Facts] ********************************************************************************************
ok: [docker-server]

TASK [Copy local python script copy to remote] ********************************************************************
ok: [docker-server]

TASK [run python script asynchronously (runs for 10 seconds)] *****************************************************
changed: [docker-server]

TASK [Some other task to run DURING asynchronous task] ************************************************************
ok: [docker-server] => {
    "msg": "Some Other task to execute DURING Async Task"
}

TASK [Get output of asynchronous task when finished] **************************************************************
FAILED - RETRYING: [docker-server]: Get output of asynchronous task when finished (10 retries left).
FAILED - RETRYING: [docker-server]: Get output of asynchronous task when finished (9 retries left).
changed: [docker-server]

TASK [Output result of asynchronous task when finished] ***********************************************************
ok: [docker-server] => {
    "msg": {
        "ansible_job_id": "j373617365284.54243",
        "attempts": 3,
        "changed": true,
        "cmd": [
            "python",
            "/home/user/projects/background-task.py"
        ],
        "delta": "0:00:10.031461",
        "end": "2023-06-17 19:18:24.510056",
        "failed": false,
        "finished": 1,
        "msg": "",
        "rc": 0,
        "results_file": "/home/user/.ansible_async/j373617365284.54243",
        "start": "2023-06-17 19:18:14.478595",
        "started": 1,
        "stderr": "",
        "stderr_lines": [],
        "stdout": "Counter at: 0\nCounter at: 1\nCounter at: 2\nCounter at: 3\nCounter at: 4\nCounter at: 5\nCounter at: 6\nCounter at: 7\nCounter at: 8\nCounter at: 9",
        "stdout_lines": [
            "Counter at: 0",
            "Counter at: 1",
            "Counter at: 2",
            "Counter at: 3",
            "Counter at: 4",
            "Counter at: 5",
            "Counter at: 6",
            "Counter at: 7",
            "Counter at: 8",
            "Counter at: 9"
        ]
    }
}

TASK [Task that runs AFTER asynchronous task] *********************************************************************
ok: [docker-server] => {
    "msg": "Task ran AFTER Async Task"
}
```

{% endraw %}

More information on [running your tasks in parallel here](/2019-07-09-ansible_run_playbooks_tasks_in_parallel).

<br/>


### Running your python script in the background even when your ansible playbook has finished (Running a detached ansible task)
If you want to **run your script in the background even** when you **ansible playbook itself** is **finished** then that means **you need a different solution** from what Ansible typically provides. Ansible is only really designed to control what is happening within the playbook's runtime.

For example in linux you can use the ```nohup```, ```disown``` or ```&``` command to run your python script in the background of a linux system - more info [here](https://askubuntu.com/questions/88091/how-to-run-a-shell-script-in-background). More info [here](https://askubuntu.com/questions/88091/how-to-run-a-shell-script-in-background) on the differences between what these commands do

The capability to keep a task running in the background is thanks to the Linux system (remote host), we only use ansible for firing the task. For other systems, you may need to use your own solution! 

For this example, we run a python script called ```background-task.py``` which basically runs for 60 seconds: 

{% raw %}

```python
import time

MAX_COUNT = 60

if __name__ == "__main__":
    
    # Count to 60 seconds
    
    counter = 0
    
    while counter < MAX_COUNT:
        time.sleep(1)  # sleep 5 seconds
        print("Counter at: {0}".format(counter))
        counter += 1
```

We will be using the ansible ```command``` module for this so that we can run the task with ```nohup``` which will make it run in the background for us even when we close our ansible task

```yaml
- hosts: docker-server
  tasks:
  - name: Copy local python script copy to remote
    ansible.builtin.copy:
      src: ../../lib/background-task.py
      dest: /home/user/projects/background-task.py

  - name: run python script in the background
    ansible.builtin.command:
      cmd: nohup python /home/user/projects/background-task.py 
    register: result

  - ansible.builtin.debug:
      msg: "{{ result }}"
```

The result - Task runs and "instantly exits" (which is the behaviour we want): 

```bash
TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": {
        "changed": true,
        "cmd": "nohup python /home/user/projects/background-task.py &",
        "delta": "0:00:01.002732",
        "end": "2023-06-17 18:42:52.581445",
        "failed": false,
        "msg": "",
        "rc": 0,
        "start": "2023-06-17 18:42:51.578713",
        "stderr": "",
        "stderr_lines": [],
        "stdout": "",
        "stdout_lines": []
    }
}
```

Our ```background-task.py``` script is STILL RUNNING in the background (which is the behavior we want), when we search for the task process:

```bash
(base) user@user-VirtualBox:~$ ps aux | grep background-task.py
user       44821  0.0  0.1  15608  6316 ?        S    18:40   0:00 python /home/user/projects/background-task.py

```

{% endraw %}

**Explanation**:
- ```ansible.builtin.shell```: I found using the shell module instead of the command module will actually run the task and exit the playbook (which is what we want)
- ```nohup``` and ```&```: I found that if you only use ```nohup``` the task would run, but the playbook would not exit. And if I only use ```&``` the doesn't seem to get executed. But a combination of both ```nohup``` and ```&``` did the trick!

<br/>


## Running your python script within an environment
In this section we look at attempting to run our python script in a venv environment and a [conda (Miniconda/Anaconda)](https://docs.conda.io/en/latest/conda.html) environment. 

The python script, ```example-env.py```:

{% raw %}
```python
import pika

if __name__ == "__main__":
    print("Success")
```
{% endraw %}

**Note**: **If we do not run this script inside our python environment** then it should **result in an error** because we purposely **only install** the ```pika``` library **inside our python environment**. 


### Running your python script within a Virtualenv environment
To run in our venv environment, just **set the executable** to the **python file in the ```bin``` folder of the venv**. For our example we have a virtualenv call "test" and so the executable on our remote server is: ```executable: /home/user/test/bin/python3```:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - name: run python script (on venv) - Should run fine
    ansible.builtin.script:
      cmd: ../../lib/example-env.py
      executable: /home/user/test/bin/python3
    register: result

  - ansible.builtin.debug:
      msg: "{{ result }}"
```

Which will result in:

```bash
TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": {
        "changed": true,
        "failed": false,
        "rc": 0,
        "stderr": "Shared connection to 192.168.0.250 closed.\r\n",
        "stderr_lines": [
            "Shared connection to 192.168.0.250 closed."
        ],
        "stdout": "Success\r\n",
        "stdout_lines": [
            "Success"
        ]
    }
}
```

{% endraw %}


If we use the **Default/Base Python environment** which **does not** have our imported ```pika``` library installed we will get an ERROR:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - name: run python script (default base) - Should throw error
    ansible.builtin.script:
      cmd: ../../lib/example-env.py
      executable: /usr/bin/python3
    register: result

  - ansible.builtin.debug:
      msg: "{{ result }}"
```

Results in an error (**As expected**):

```yaml
TASK [run python script (default base) - Should throw error] ******************************************************
An exception occurred during task execution. To see the full traceback, use -vvv. The error was: NoneType: None
fatal: [docker-server]: FAILED! => {"changed": true, "msg": "non-zero return code", "rc": 1, "stderr": "Shared connection to 192.168.0.250 closed.\r\n", "stderr_lines": ["Shared connection to 192.168.0.250 closed."], "stdout": "Traceback (most recent call last):\r\n  File \"/home/user/.ansible/tmp/ansible-tmp-1687018537.7973392-14978-219156927309397/example-env.py\", line 1, in <module>\r\n    import pika\r\nModuleNotFoundError: No module named 'pika'\r\n", "stdout_lines": ["Traceback (most recent call last):", "  File \"/home/user/.ansible/tmp/ansible-tmp-1687018537.7973392-14978-219156927309397/example-env.py\", line 1, in <module>", "    import pika", "ModuleNotFoundError: No module named 'pika'"]}
```

{% endraw %}

<br/>

### Running your python script within a Conda (Anaconda/Miniconda) environment
Just like with venv, we just need to set the executable to the python file inside the environment's ```bin``` folder.

{% raw %}

```yaml
- hosts: docker-server
  tasks:
  - name: run python script (on conda) - Should run fine
    ansible.builtin.script:
      cmd: ../../lib/example-env.py
      executable: /home/user/miniconda3/envs/test-conda/bin/python3
    register: result

  - ansible.builtin.debug:
      msg: "{{ result }}"
```

{% endraw %}

<br/>

## Passing Ansible variables as arguments when running python script 
Passing arguments with the ```script```, ```command```, ```shell``` and ```raw``` modules is quite straight forward:

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - name: run python script with args
    ansible.builtin.script:
      cmd: ../../lib/pass-args.py item-one item-two
      executable: /usr/bin/python3
    register: result

  - ansible.builtin.debug:
      msg: "{{ result }}"

  - name: Copy local python script copy to remote
    ansible.builtin.copy:
      src: ../../lib/pass-args.py
      dest: /home/user/projects/pass-args.py

  - name: Execute Python Script and pass args using the shell module
    ansible.builtin.shell:
      cmd: python3 /home/user/projects/pass-args.py item-one item-two
    register: result

  - debug:
      msg: "{{ result }}"

  - name: Execute Python Script and pass args using the command module
    ansible.builtin.command:
      # cmd: python3 /home/user/projects/pass-args.py
      argv:
        - python3
        - /home/user/projects/pass-args.py
        - item-one
        - item-two
    register: result

  - debug:
      msg: "{{ result }}"

  - name: Execute Python Script and pass args using the raw module
    ansible.builtin.raw: python3 /home/user/projects/pass-args.py item-one item-two
    register: result

  - debug:
      msg: "{{ result }}"
```

{% endraw %}

<br/>

### Passing a list arg to your python script
Lets say you have a list variable in your Ansible playbook, and you want to pass that to your python script. 

**NOTE** - any parameter you pass as an argument will always be a STRING type in your python code as you can see in the example code below. Ideally if you want to be passing lots of stuff to a python script, maybe you should consider converting your python script into an [ansible module](https://docs.ansible.com/ansible/latest/dev_guide/developing_modules_general.html) - We look at this in the next section!

{% raw %}

Python script:

```python
import sys

if __name__ == "__main__":
    print("Printing Args")
    for arg in sys.argv:
        print("type: {0}, value: {1}".format(type(arg), arg))
```

Ansible playbook:

```yaml
  - name: Execute Python Script and pass args using the command module
    ansible.builtin.command:
      # cmd: python3 /home/user/projects/pass-args.py
      argv:
        - python3
        - /home/user/projects/pass-args.py
        - item-one
        - item-two
        - [1,2,3]
    register: result

  - debug:
      msg: "{{ result }}"
```

If we run this, the output would be:

```bash
TASK [Execute Python Script and pass args using the command module] ***********************************************
changed: [docker-server]

TASK [debug] ******************************************************************************************************
ok: [docker-server] => {
    "msg": {
        "changed": true,
        "cmd": [
            "python3",
            "/home/user/projects/pass-args.py",
            "item-one",
            "item-two",
            "[1, 2, 3]"
        ],
        "delta": "0:00:00.011323",
        "end": "2023-06-17 23:59:14.999632",
        "failed": false,
        "msg": "",
        "rc": 0,
        "start": "2023-06-17 23:59:14.988309",
        "stderr": "",
        "stderr_lines": [],
        "stdout": "Printing Args\ntype: <class 'str'>, value: /home/user/projects/pass-args.py\ntype: <class 'str'>, value: item-one\ntype: <class 'str'>, value: item-two\ntype: <class 'str'>, value: [1, 2, 3]",
        "stdout_lines": [
            "Printing Args",
            "type: <class 'str'>, value: /home/user/projects/pass-args.py",
            "type: <class 'str'>, value: item-one",
            "type: <class 'str'>, value: item-two",
            "type: <class 'str'>, value: [1, 2, 3]"
        ]
    }
}
```


{% endraw %}

<br/>

## Getting python script output and using it as Ansible Variable
Lets say we have a scenario where we want to:
1. pass a list of values to a python script from ansible
2. get the output as a list of objects 
3. iterate through that list of objects in ansible

So the input and output would be something like:

**input**: "item-one", "item-two"

**output**: ```[{ "value": "item-one", "extra": "" }, { "value": "item-two", "extra": "" }]```


{% raw %}
python script:

```python
import sys

if __name__ == "__main__":
    
    # Get input
    list_size = len(sys.argv)
        
    if list_size <= 1:
        raise Exception("Need to pass a param")
    
    index = 1
    
    # Iterates through each argument and modifies input data
    while index < list_size:
        i = {
            "value": sys.argv[index],
            "extra": ""
        }
        print(i)
        index += 1
```

ansible playbook:

```yaml
- hosts: docker-server
  vars:
    params: item-one item-two
  tasks:
  - name: run python script and pass params to modify
    ansible.builtin.script:
      cmd: ../../lib/modify_list.py {{ params }}
      executable: /usr/bin/python3
    register: result
  
  - name: convert string list result into proper list object
    ansible.builtin.set_fact:
      output_list: "{{ result.stdout.splitlines() | map('from_yaml') | list }}"

  - name: iterate through output list
    ansible.builtin.debug:
      msg: "{{ item }}"
    with_items: "{{ output_list }}"
      
```

Results in:
```bash
TASK [iterate through output list] ********************************************************************************
ok: [docker-server] => (item={'value': 'item-one', 'extra': ''}) => {
    "msg": {
        "extra": "",
        "value": "item-one"
    }
}
ok: [docker-server] => (item={'value': 'item-two', 'extra': ''}) => {
    "msg": {
        "extra": "",
        "value": "item-two"
    }
}
```

**Explanation**:
1. ```modify_list.py``` / python script: the python script accepts input parameters via sys.argv. In order to "output" to ansible, we use python's print. 
2. convert python script string output to a list: In order to do this we use the following technique ```"{{ result.stdout.splitlines() | map('from_yaml') | list }}"```
3. iterate through output list: Now that we have a list object, we simply use ```with_items``` to iterate through it

Having said this, If you really do have this scenario, I'd say it's probably better to create your own ansible module - More on this in the next section!

{% endraw %}

<br/>

### A better solution: convert your python script into your own ansible module
Honestly if you are finding yourself **using a python script in such a way** that you are **passing parameters** to it and **reading output** values from it... Then **you really should just create your own custom ansible module**.

And **NO it's not complicated** - its **quite easy**. In fact if you already have an **existing python file**, you can just **convert it into an ansible module!**

#### Benefits of writing your own Ansible module:
- You have **control of the input and output param types**. This means that you don't need to work with just strings (like in the previous section) and can work with lists, dictionaries and more!
- **Better validation** since you can control your parameter types. You can also specify if something is required
- It's actually quite **quick and easy to convert an existing python script** into an Ansible module
- Easier to **specify your own custom outcomes** (e.g. errors)
- **input params are more readable** in your ansible playbook
- **easier to work with outputs** since you **don't need to convert from string** output 

<br/>

#### Example custom ansible module

To create your own module, simply create a folder called ```library``` in the same folder you run your playbook on, and create your python script inside that folder. For me detailed info on creating your own custom module, check the [Ansible Docs](https://docs.ansible.com/ansible/latest/dev_guide/developing_modules_general.html).


{% raw %}
Python file - ```/library/modify_list.py```:

>NOTE: Most of the code I got from the Ansible Docs, I just tweaked it and removed the DOCUMENTATION doc string for example’s sake

```python
from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

from ansible.module_utils.basic import AnsibleModule


def run_module():
    # define available arguments/parameters a user can pass to the module
    module_args = dict(
        some_list=dict(type='list', required=True)
    )

    # seed the result dict in the object
    # we primarily care about changed and state
    # changed is if this module effectively modified the target
    # state will include any data that you want your module to pass back
    # for consumption, for example, in a subsequent task
    result = dict(
        output=[]
    )

    # the AnsibleModule object will be our abstraction working with Ansible
    # this includes instantiation, a couple of common attr would be the
    # args/params passed to the execution, as well as if the module
    # supports check mode
    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=True
    )

    # if the user is working with this module in only check mode we do not
    # want to make any changes to the environment, just return the current
    # state with no modifications
    if module.check_mode:
        module.exit_json(**result)


    # during the execution of the module, if there is an exception or a
    # conditional state that effectively causes a failure, run
    # AnsibleModule.fail_json() to pass in the message and the result
    if len(module.params['some_list']) <= 1:
        module.fail_json(msg='some_list needs more than 1 item', **result)

    # Code to modify input list - Our custom python code
    for item in module.params['some_list']:
        result['output'].append({"value": item, "extra": "n/a"})

    # in the event of a successful module execution, you will want to
    # simple AnsibleModule.exit_json(), passing the key/value results
    module.exit_json(**result)


def main():
    run_module()


if __name__ == '__main__':
    main()
```
Ansible playbook:

```yaml
- hosts: docker-server
  tasks:
  - name: run our test module
    modify_list:
      some_list: 
      - one
      - two
    register: output_list

  - name: iterate through module output (a list)
    debug:
      msg: '{{ item }}'   
    with_items: "{{output_list.output }}"
```

The Result:

```bash
TASK [iterate through module output (a list)] *********************************************************************
ok: [docker-server] => (item={'value': 'one', 'extra': 'n/a'}) => {
    "msg": {
        "extra": "n/a",
        "value": "one"
    }
}
ok: [docker-server] => (item={'value': 'two', 'extra': 'n/a'}) => {
    "msg": {
        "extra": "n/a",
        "value": "two"
    }
}
```

**NOTE** - If you've noticed, our actual python code for manipulating input is just 3 lines. We've saved lines of code because we don't have to convert our input into a list that we can work with, the input is already a list type. Even out ansible playbook code has significantly less lines and complications!

```python
    # Code to modify input list - Our custom python code
    for item in module.params['some_list']:
        result['output'].append({"value": item, "extra": "n/a"})
```

{% endraw %}

<br/>

## Conclusion

Whew... If you've read through all that then I'm believing that you found something of value. If there's something I may have missed - do give us a shout as I'd be interested in other unique scenarios you might have when using Ansible! 
