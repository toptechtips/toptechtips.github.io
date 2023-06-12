---
layout: post
title: Complete Guide to Ansible Conditionals, Tests, Asserts, When - with examples
comments: true
subtitle: 
show-avatar: false
toc: true
tags: [ansible, jinja]
---

For some people a **simple playbook is not always practical**. So you find that you need some **logic** in your **playbooks** for your not so simple use case. Thankfully Ansible provides multiple ways to do this particularly using **Jinja** in Ansible's templating.

However, because of this - I find it **quite tricky** to understand and use the **logic techniques** and the different **data types** that can potentially get passed around in my playbooks because **Ansible uses YAML template and Jinja**. So I wrote this guide to help your through the hassle of that!

**Pre-requisites**
- Ansible core 2.14
- Python 3 for Ansible host and any managed hosts

> You can use a different version of python or Ansible core but just be wary that some of the implementations on this document might not work on much older versions of Ansible or require a different method

<br/>

## What are Ansible Conditionals and Ansible the When Keyword?
Conditionals in Ansible is simply a condition that is set in order to perform a task. This is done by using the ```when``` keyword.

{% raw %}
```yaml
- hosts: docker-server
  vars:
    trigger_condition: fasle
  tasks:
  - ansible.builtin.debug:
      msg: "This message triggered due to the conditional"
    when: trigger_condition == true

  - ansible.builtin.debug:
      msg: "This message will always run"
```
{% endraw %}

<br/>

## What are Ansible Tests?
According to the [Ansible docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tests.html), Tests are:
> a way of evaluating template expressions and returning True or False

### Ansible Test vs Filter? 
After ansible 2.9 you **must use** jinja **test syntax** as opposed to **filter syntax** when performing a test:
{% raw %}
- **filter syntax**: ```{{ name|striptags|title }}``` (remove all HTML Tags from variable name and title-case the output (title(striptags(name))))
- **test syntax**: ```{% if loop.index is divisibleby 3 %}```
{% endraw %}

**Tests** will be used for **comparisons**, and **filter** is used for **data manipulation**. Having said this, You can still use tests in filters e.g. in a ```select()``` filter you can use test logic to select a value for a list 

You can use all the built-in [Jinja Tests](https://jinja.palletsprojects.com/en/latest/templates/#builtin-tests) with Ansible, but Ansible also comes with its [other set of tests](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tests.html#type-tests).

<br/>

## What is "assert" in Ansible?
Assert is a [core ansible module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/assert_module.html) that is used for **asserting if an expression is true** whilst displaying a **custom messages** based on the **outcome**. 

This is a very useful module when you want to **add logic** to your playbooks that may require **multiple conditions**.

If you run the playbook example below, it will stop at task 2 because it will fail at task 2. However, if I set ```ignore_errors``` to ```true```, task 2 will fail but will not stop task 3 from happening:

{% raw %}

```yaml
- hosts: docker-server
  vars:
    counter1: 0
    counter2: 3
    counter3: -1
  tasks:
  - ansible.builtin.assert:
      that:
        - counter1 >= 0
        - counter1 <= 1
      success_msg: "counter is between 0 and 2"
      fail_msg: "counter needs to be between 0 and 2"

  - ansible.builtin.assert:
      that:
        - counter2 >= 0
        - counter2 <= 1
      success_msg: "counter is between 0 and 2"
      fail_msg: "counter needs to be between 0 and 2"

  - ansible.builtin.assert:
      that:
        - counter3 >= 0
        - counter3 <= 1
      success_msg: "counter is between 0 and 2"
      fail_msg: "counter needs to be between 0 and 2"

```
{% endraw %}

<br/>


### Is a variable is defined or registered or undefined

To test if a variable is defined (or not), we simply need to use the ```defined``` and ```undefined``` keywords.


#### Using the Jinja defined() to check for defined or undefined variables
{% raw %}

Variable ```name``` is **defined but nothing is assigned**, results in "name var is defined":

```yaml
- hosts: docker-server
  vars:
    name: 
  tasks:
  - ansible.builtin.debug:
      msg: "name var is defined"
    when: name is defined
```

Variable ```name``` is **defined but is an empty string**, results in "name var is defined":

```yaml
- hosts: docker-server
  vars:
    name: ""
  tasks:
  - ansible.builtin.debug:
      msg: "name var is defined"
    when: name is defined
```

Variable ```name``` is **not defined** in the var section, task does not run.

```yaml
- hosts: docker-server
  vars:
  tasks:
  - ansible.builtin.debug:
      msg: "name var is defined"
    when: name is defined
```
{% endraw %}

<br/>

#### Using Jinja undefined() test to check for defined or undefined variables

{% raw %}
Variable ```name``` **is defined**, results in task not running:

```yaml
- hosts: docker-server
  vars:
    name:
  tasks:
  - ansible.builtin.debug:
      msg: "name var is defined"
    when: name is undefined
```

```yaml
- hosts: docker-server
  vars:
    name:
  tasks:
  - ansible.builtin.debug:
      msg: "name var is defined"
    when: name is undefined
```

Variable ```name``` is **not defined**, results in the task running:
```yaml
- hosts: docker-server
  vars:
  tasks:
  - ansible.builtin.debug:
      msg: "name var is defined"
    when: name is undefined
```
{% endraw %}

<br/>

### Is a variable is true or false

You can use the simple ```is``` or ```is not``` in your tests. You can use something like ```var | bool == True``` - But I **be wary** because it will **result in True** even if the value is ```true``` or ```"true"```.

{% raw %}

value = true, task **will run**:

```yaml
- hosts: docker-server
  vars:
    value: true
  tasks:
  - ansible.builtin.debug:
      msg: "is true"
    when: value is true
```

value = "true" (Note the quotes), Task **will NOT run**:

```yaml
- hosts: docker-server
  vars:
    value: "true"
  tasks:
  - ansible.builtin.debug:
      msg: "is true"
    when: value is true
```

value = true (Note the quotes), Task **will NOT run**:

```yaml
- hosts: docker-server
  vars:
    value: true
  tasks:
  - ansible.builtin.debug:
      msg: "is true"
    when: value is not true
```

{% endraw %}

<br/>

### Is a variable is empty

There are multiple ways to **check if something is empty**, but each method will be different for different data types. On top of that **Ansible has a truthy and falsy test** which allows us to test in a **python-like truthy and falsy way**.

This [stackOverflow Answer](https://stackoverflow.com/questions/39983695/what-is-truthy-and-falsy-how-is-it-different-from-true-and-false) shows us that everything is a considered "truthy" except the following values which are considered "falsy":

- ```None```
- ```False```
- ```0```
- ```0.0```
- ```[]``` an empty list
- ```{}``` an empty dict
- ```""``` and empty string


#### Check if string / dict / array empty or None

{% raw %}

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "is falsy - value is None"
    when: value is falsy
    vars:
      value: 

  - ansible.builtin.debug:
      msg: "is falsy - empty string"
    when: value is falsy
    vars:
      value: ""

  - ansible.builtin.debug:
      msg: "is falsy - empty array"
    when: value is falsy
    vars:
      value: []

  - ansible.builtin.debug:
      msg: "is falsy - empty dict"
    when: value is falsy
    vars:
      value: {}
```

You can also use ```not``` to achieve the same results as a falsy check:
```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "is falsy - empty dict"
    when: not value
    vars:
      value: 
```

<br/>

#### Other ways to check string / dict / array is empty

Using the Jinja ```length``` filter. 

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "empty string"
    when: value | length <= 0 
    vars:
      value: ""

  - ansible.builtin.debug:
      msg: "empty dict"
    when: value.keys() | length <= 0 
    vars:
      value: {}

  - ansible.builtin.debug:
      msg: "empty list"
    when: value | length <= 0 
    vars:
      value: []
```

{% endraw %}


<br/>

### Is variable equal to a string

{% raw %}

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "string matches"
    when: value == "hi" 
    vars:
      value: "hi"
```

<br/>

### (Advanced) ways to match string e.g. pattern or regex matching
Ansible offers other ways to match string patterns using the ```match```, ```search``` and ```regex``` tests for this. You also can use the ```multiline``` and ```ignorecase``` if you're dealing with multi-line strings or if you want to ignore string's case. More details in the [Ansible Docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tests.html#testing-strings)

#### Example - wildcard matching file names using ```match```
Using ```match``` We match for any substring that has .log

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "Will not match because ''.log' needs to be at start of string"
    when: file_name is match('.log')
    vars:
      file_name: "test_data.log"

  - ansible.builtin.debug:
      msg: "match any file name with .log in its name"
    when: file_name is match('.*log')
    vars:
      file_name: "test_data.log"

  - ansible.builtin.debug:
      msg: "will still match since '.*log was matched'"
    when: file_name is match('.*log')
    vars:
      file_name: "test_data.log.1"
```

**How** ```match``` **works**
- ```match``` returns true if the **string pattern** matches the **start** of the target string - which is why task 1 fails.
- Task 2 and 3 return True because both match even if there are more characters after the matched part
- ```match``` is typically used when you want to check if a **keyword exists at least once** in a string.

<br/>

#### Wildcard matching URL pattern using ```search```
Using ```search``` to search for any matching substring pattern.

```yaml
  - ansible.builtin.debug:
      msg: "found items str"
    when: url is search('items')
    vars:
      url: "http://example.com/api/1234/items/item/434"

  - ansible.builtin.debug:
      msg: "found api/.*/items pattern"
    when: url is search('/api/.*/items')
    vars:
      url: "http://example.com/api/1234/items/item/434"

  - ansible.builtin.debug:
      msg: "Will not find api/.*/update pattern"
    when: url is search('/api/.*/update')
    vars:
      url: "http://example.com/api/1234/items/item/434"
```

```search``` works similarly to ```match``` except it looks for a pattern anywhere the target string. You can use wildcards to enhance your pattern.

<br/>

#### Using regex matching for simple email validation
```regex``` works like ```search``` but allows for more options when it comes to other types of tests.

In this example we use ```regex``` for validating if a string is a valid email or not

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "valid email"
    when: email is regex('\S+@\S+\.\S+$')
    vars:
      email: "example@gmail.com"

  - ansible.builtin.debug:
      msg: "invalid email"
    when: email is not regex('\S+@\S+\.\S+$')
    vars:
      email: "example--gmail.com"
```

{% endraw %}

<br/>

### Does the item exist in list (or is not in list)

Here we check if some items are in (or not in) a list

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "hello value in items list"
    when: '"hello" in items'
    vars:
      items:
        - "hello"
        - "bye" 

  - ansible.builtin.debug:
      msg: "hello value not in items list"
    when: '"hello" not in items'
    vars:
      items:
        - "bye" 

  - ansible.builtin.debug:
      msg: "1 value in items list"
    when: '1 in items'
    vars:
      items:
        - 1
        - "bye" 
```
{% endraw %}

<br/>

### Does the key or value exists in dictionary

{% raw %}

#### Check if dictionary key exists (or does not), also in nested key
Here we check if a key is in or is not in a dictionary variable. The last example shows how you can check if a key exists in a nested dictionary.
```yaml
  - ansible.builtin.debug:
      msg: "key:hello in items dict"
    when: '"hello" in items'
    vars:
      items:
        hello: "hi" 

  - ansible.builtin.debug:
      msg: "key:hello not in items dict"
    when: '"hello" not in items'
    vars:
      items:
        bye: "bye" 

  - ansible.builtin.debug:
      msg: "key:hello in items dict"
    when: '"hello" in items.nested_items'
    vars:
      items:
        nested_items:
          hello: "hello" 

```

<br/>

#### Check if dictionary value exists (or does not)
Quite simply:

```yaml
  - ansible.builtin.debug:
      msg: "value hi equal the 'hello' key"
    when: items.hello == "hi"
    vars:
      items:
        hello: "hi" 
```

{% endraw %}

<br/>

## Example Scenarios
Here we look at different scenarios that use conditionals and tests!

### Scenario - Assert Check two string keywords or multiple test conditions

Asserts that "ford" AND "focus" substring is found in the "model" variable. Assert will return success when all conditions are correct 

{% raw %}

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.assert:
      that:
        - "'ford' in model"
        - "'focus' in model" 
      fail_msg: "wrong car model"
      success_msg: "correct car model"
    vars:
      model: "ford focus ST"
```

Asserts that either "ford" OR "honda" substring is found in the "model" variable.

```yaml
  - ansible.builtin.assert:
      that:
        - "'ford' in model | lower or 'honda' in model | lower" 
      fail_msg: "wrong car model"
      success_msg: "correct car model"
    vars:
      model: "Ford civic SE"
```

Note: I add in the ```lower()``` Jinja filter so that ```assert``` is not case-sensitive.

{% endraw %}

<br/>

### Scenario - Run Task when variable is undefined

{% raw %}

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "name var is undefined"
    when: name is undefined
```

{% endraw %}

<br/>

### Scenario - Run task only when a variable contains a specific string
There are 2 ways to go about this:
1. Use ```in```: which can also be used when checking if a value is in a list or dict
2. Use ```search```: which will check if a string is inside your target string


{% raw %}

```yaml
- hosts: docker-server
  tasks:
  - ansible.builtin.debug:
      msg: "value found"
    when: "'hi' in message" 
    vars:
      message: "hi, nice to meet you"

  - ansible.builtin.debug:
      msg: "value found"
    when: "message is search('hi')" 
    vars:
      message: "hi nice to meet you"
```
{% endraw %}

<br/>


### Scenario - Check that a list of variables have been defined

In this example, specify a list of variables that need to be defined, and we check that each of them are defined. var1 is defined, whilst var2 and var3 are not:

{% raw %}
```yaml
- hosts: docker-server
  vars:
    var1:
    list_of_vars_to_define: 
      - var1
      - var2
      - var3
  tasks:
  - ansible.builtin.debug:
      msg: "Need to set variable {{ item }}"
    when: vars[item] is undefined
    loop: "{{ list_of_vars_to_define }}"

```

Note: 
- we use a **loop to repeat the task** for each variable name that we want to check
- we use ```vars[item]``` because if just use '''item''' the expression we are evaluating will be ```"var1" is undefined``` 

{% endraw %}

<br/>


### Scenario - Assert failure when source list holds more values than target list

In this scenario we want to make compare 2 lists and make sure that the target list's length is equal to the source list's length:

{% raw %}
```yaml
- hosts: docker-server
  vars:
    source_list: [1,2,3,4]
    target_list: [1,2,3,4,5,6]
  tasks:
  - ansible.builtin.assert:
      that:
        - source_list | length == target_list | length
      success_msg: "Both Lists have matching lengths"
      fail_msg: "Both Lists DO NOT have matching lengths"
```

**Explanation**
- We get the length of each list using the ```length``` jinja filter
- We check that both lists have the same length

{% endraw %}

<br/>

### Scenario - Check if for a value match in list of dictionary/objects

We have a scenario where we have a list of exempt host names (a list of objects/dictionaries). We want our task to only run when the current ```ansible_hostname``` is not on that list - This is a scenario where we want to find out if a value exists in a list of dictionaries.

{% raw %}
```yaml
- hosts: docker-server
  vars:
    list_of_exempt_hosts:
      - { host_name: "api-server" }
  tasks:
    - ansible.builtin.debug:
        msg: "Current hostname: {{ ansible_hostname }}"

    - ansible.builtin.debug:
        msg: "current ansible_hostname is not in list of exempt hosts"
      when:  list_of_exempt_hosts | selectattr("host_name", 'equalto', ansible_hostname) | list | length == 0
```

Which results in:

```bash
TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": "Current hostname: user-VirtualBox"
}

TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": "current ansible_hostname is not in list of exempt hosts"
}
```
{% endraw %}

When we run our playbook, the ansible_hostname is "user-VirtualBox" which is not defined on our list of exempt hosts therefore the task is run on that host.

**Explanation**:

We use the ```selectattr``` [Jinja Filter](https://jinja.palletsprojects.com/en/latest/templates/#jinja-filters.selectattr) to return a filtered version of the list where the only items in the list are dictionaries that have a ```host_name``` equal to the ```ansible_hostname```. If there is no match (meaning the current ansible_hostname is not in our list_of_exempt_hostnames), then the list will be empty to which we can check by using the ```length``` filter

<br/>


### Scenario - Assert fail when a string is found only once in a string | Using regex_findall() to give all instances of a subtring

In our example, the word "test" is in our string 3 times. We assert that if the string "test" is in some_text more than once, it's a fail, otherwise a success: 

{% raw %}
```yaml
- hosts: docker-server
  vars:
    some_text: "herhtesteruwe rwutestfugoe goi test ejfvosj ofvi ejoi"
  tasks:
    - ansible.builtin.assert :
        that:
          - some_text | regex_findall('test') | length > 1
        fail_msg: "the string 'test' has appeared more than once"
        success_msg: "the string test has appeared less than once"
```
{% endraw %}

**Explanation**:
- We use ansible's [regex_findall](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/regex_findall_filter.html) filter which returns a list of all the matched parts of a string.
- We then use length filter to determine if our matched phrase occurs more than once, in which case asserts a fail

<br/>

### Scenario - Filter list based on matched string item | Using select with regex match
In this scenario, we have a list of URLs, and we want to filter that list based on some string matching. Specifically we want to filter for all string items ending with ".ru": 

{% raw %}
```yaml
- hosts: docker-server
  vars:
    some_list:
      - example.com
      - helloexample.com
      - fhello.com
      - sample.ru
      - h.ru
      - hello.co.uk
      - bye.ru.com
      - hello.rush.com
  tasks:
    - ansible.builtin.debug:
        msg: "{{ some_list  | select('match', '.*.ru$') }}"
```

The output is:
```bash
TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": [
        "sample.ru",
        "h.ru"
    ]
}
```
{% endraw %}

**Explanation**:
- We use the ```select``` jinja filter to filter our list of string based on a matching pattern
- Our matching pattern ```.*.ru$``` means that we are looking for anything that ends in ".ru" - it has to be at the end of the string item!
- We use the regex type matching since we have a regex pattern

<br/>


### Scenario - Ansible Ignore errors in tasks and fail at end of the playbook if any tasks had errors

We want to run a block of tasks (Task 1, Task 2 and Task 3) and if any of these tasks fail we still want all the other tasks to be executed. Instead, we want the "failure" event to happen at the end.

In this example, I purposely make task 2 fail.

{% raw %}
```yaml
- hosts: docker-server
  tasks:
  - block:
    - ansible.builtin.debug:
        msg: Task 1
      register: t1
  
    - name: Task 2
      shell: 'false'
      register: t2

    - ansible.builtin.debug:
        msg: Task 3
      register: t3

    ignore_errors: yes
    always:
    - ansible.builtin.debug:
        msg: "task results: {{ [t1.failed, t2.failed, t3.failed] }}"

  - ansible.builtin.fail:
      msg: "at least one task failed"
    when: true in [t1.failed, t2.failed, t3.failed]

  - name: "some other task which wont run because we will fail on previous task"
    ansible.builtin.debug:
      msg: "Some other task to run"
```

This results in:

```bash
TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": "Task 1"
}

TASK [Task 2] *****************************************************************************************************
fatal: [docker-server]: FAILED! => {"changed": true, "cmd": "false", "delta": "0:00:00.001542", "end": "2023-06-12 18:43:47.099767", "msg": "non-zero return code", "rc": 1, "start": "2023-06-12 18:43:47.098225", "stderr": "", "stderr_lines": [], "stdout": "", "stdout_lines": []}
...ignoring

TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": "Task 3"
}

TASK [ansible.builtin.debug] **************************************************************************************
ok: [docker-server] => {
    "msg": "task results: [False, True, False]"
}

TASK [ansible.builtin.fail] ***************************************************************************************
fatal: [docker-server]: FAILED! => {"changed": false, "msg": "at least one task failed"}
```

{% endraw %}

You can see that Task 2 fails, Task 1 and 3 still ran fine. Then the playbook fails after Task 1, 2 and 3 ran. Our very last task which is to be executed after our block of tasks does not even run since the playbook failed after our block of tasks


**Explanation**
- We use Ansible's [Block](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_blocks.html) structure to group our tasks together and also to collectively ```ignore_error``` for all tasks within that block.
- We ```register``` the result of each task within the block.
- Outside our block, we use Ansible's [Fail](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/fail_module.html) module to forcefully stop and fail the playbook if our condition is met.
- We use the following condition with our fail module ```when: true in [t1.failed, t2.failed, t3.failed]``` so that we fail if ```true``` is found in any of the task results.

<br/>

### Scenario - only show assert error output and not assert success

In this scenario we emulate the results of 3 tasks in a results' dictionary. We want to loop through each result item and assert that the value of the key "failed" == false. If the value is true, then assert false. 

We ONLY want to see the message output of the failed assert, we don't want to show any output from the successful asserts. For this example task item 1 and task item 3 will be a successful assert whilst task item 2 will NOT:

{% raw %}
```yaml
- hosts: docker-server
  vars:
    results: 
    - { "task": "task 1", "failed" : false, "misc_data": "blhjassaljsi efwoeirf oewif oi" }
    - { "task": "task 2", "failed" : true, "misc_data": "blhjassaljsi efwoeirf oewif oi" }
    - { "task": "task 3", "failed" : false, "misc_data": "blhjassaljsi efwoeirf oewif oi" }
  tasks:
  - ansible.builtin.assert:
      that:
        - item.failed == false 
      fail_msg: "{{ item.task }} is false"
      quiet: yes
    loop: "{{ results }}"
    loop_control:
      label: "{{ item.task }}"
```

This outputs:

```yaml
TASK [ansible.builtin.assert] *************************************************************************************
ok: [docker-server] => (item=task 1)
failed: [docker-server] (item=task 2) => {"ansible_loop_var": "item", "assertion": "item.failed == false", "changed": false, "evaluated_to": false, "item": {"failed": true, "misc_data": "blhjassaljsi efwoeirf oewif oi", "task": "task 2"}, "msg": "task 2 is false"}
ok: [docker-server] => (item=task 3)
```

{% endraw %}

**Explanation**:
- We use [Ansible's Assert](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/assert_module.html) ```quiet``` setting to avoid verbose output.
- We then use ```label``` with [Ansible's Loop Control](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html#limiting-loop-output-with-label) to control the output of each loop / each assert result. This way only the failed asserts are verbose whilst the successful ones only show the field "task"

<br/>

## FAQ
### Should I use assert or failed_when?
Both achieve the same purpose but assert is better when handling multiple conditions and want to get feedback on which assert fail. Whereas use Ansible's ```failed_when``` when there is only 1 condition, and you want to write less script. Here's an awesome [article](https://blog.veloc1ty.de/2022/10/24/ansible-why-you-should-user-assert-instead-of-failed-when/) written about this subject.

<br/>

### What's the success equivalent to failed_when?
failed_when is for defining what a task considers as a fail. There is no feature for a "success_when", but instead you can use [Ansible's Assert](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/assert_module.html)

<br/>

## Conclusion
Whew, I haven't written anything this long, in a long while (well except big project code at work?). But if you've read this far, I do hope you found something useful!

<br/>