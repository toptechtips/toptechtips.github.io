---
layout: post
title: How to track local variables of a python function for effective debugging
comments: true
subtitle: In this guide we explore 3 ways to trace the local variables during a python function execution using print, logging, Elastic APM and sys.settrace()  
show-avatar: false
tags: [python, settrace, setprofile, debugging, APM]
---

> I've always loved programming IDEs that have good debugging capabilities. I like using [PyCharm's](https://www.jetbrains.com/pycharm/) debugging capabilities when it comes to debugging or tracing my local variables in my Python functions. The problem I run into nowadays, is that I have a program that I want to run continuously, but I cannot be there to monitor it continuously on the debugger and so.

In this post we explore 3 methods that I have used to tackle this issue of how to track and store local variables changes during function execution:
- using log or print to output changes in local variables within a function 
- using [Elastic APM](https://www.elastic.co/guide/en/apm/agent/python/current/index.html) to log your points of change into a detailed dashboard with a lot of features for tracking function execution
- using python's built-in sys.settrace() or sys.setprofile() functions to trace local variable changes without modifying function code

> If you're in a rush just go to Solution 3 -> that's probably that one you want


<br>

## Solution 1 - Use print or log at certain points of the function

Effectively the ```print``` or ```log``` statements act as breakpoints.

{% raw %}
```python
def my_func():
    print("start of my func")
    try:
       print(locals())  # We print the local vars at this line of code 
       outcome = do_something()
       print(locals())  # We print the local vars at this line of code
       print("my_func success: {0}".format(outcome))
        return True
    except Exception as e:
       print("Some error in my_func: {0}".format(e))
    return False
```
{% endraw %}

**Pros**
- Simple and easy to implement
- You can make add as many "log or print points" to track more local variable changes
- You can print/log as many local variables you want

**Cons**
- Hard to maintain and scale (becomes more inconvenient as your program scales)
- If your function's behavior changes, you may have to change how your log/print points in order to better track your local variables
- You have to add extra code "fluff" within the function. Imagine if half the lines for your function is dedicated to local variable tracking... It makes your python function impure and less clean.

<br>

## Solution 2 - Use Elastic's APM to monitor your python code

Since I got tired of prints and logs, I wanted a more presentable way of tracking local variables for debugging. So I tried Elastic's APM tool. You need to setup APM server and then you need to import the APM python library to your code but once you have that setup, it's pretty easy and simple to capture a function's activity without having to code may print or log points to act as breakpoints. You even get a nice flowchat to represent the different function executions. My favourite part of the UI is how it tracks exceptions that are caught and it even shows you where in the code it occurs.

If you are interested, [here](https://toptechtips.github.io/2019-07-08-add_python_code_to_apm/) is a detailed tutorial on how you can get this setup: 

Here's an example:

{% raw %}
```python
from elasticapm import Client

client = Client(service_name="test")

@elasticapm.capture_span()  # add a decorator to start tracking your function 
def do_thing():
    sleep(5)

if __name__ == "__main__":
    client.begin_transaction(transaction_type="track-do-thing")

    sleep(4)
    do_thing()
    sleep(4)

    client.end_transaction("finish-do-thing", "success")

    client.capture_message(message="Test Log Message", custom=locals())
```
{% endraw %}


**Pros**
- It's as simple as adding a decorator to a function to capture what's happening within
- You have the option to add custom data/fields which you can use to track your local variables
- It can track errors and exception and can even show you where in the code the error happens, through the APM dashboard
- Can be used for gaining insight to your code's performance and can measure all sorts of metrics and custom metrics
- Elastic APM has a pretty good UI and has lots of other feautres  


**Cons**
- Might be a bit overkill to setup or use especially for a small project
- If you want to add more detail you'd still have to add extra code within your functions
- Not actually that good for debugging, more to do with performance monitoring

<br/>

## Solution 3 (THE BEST ONE) - use Python's settrace or setprofile to track local variable changes and events of your function(s)

Python gives you access to some powerful tracing capabilities within it's ```sys``` module. You can use the settrace() function to trace all the frame events that occur within your python execution.

You can use [sys.settrace()](https://docs.python.org/3/library/sys.html#sys.settrace) to trace the following events: ```call```, ```line```, ```return```, ```exception``` or ```opcode```. 

And you can also use [sys.setprofile()](https://docs.python.org/3/library/sys.html#sys.setprofile) to trace the following events: ```call```, ```return```, ```c_call```, ```c_return```, ```c_exception``` 



## How to use Python's settrace function

For this first example, we simply trace EVERY event and print the event name, function name, line number and the source code of that line!

{% raw %}
```python
import sys
from types import FrameType
import traceback


# trace function to print every frame event, the function name, the line and the raw code of that line
def trace_func(frame: FrameType, event, arg):
    stack = traceback.extract_stack(limit=2)
    code = traceback.format_list(stack)[0].split('\n')[1].strip()  # gets the source code of the line
    locals()
    
    print("Event: {0}  Func: {1}, Line: {2}, raw_code: {3}".format(event, 
                                                    frame.f_code.co_name,
                                                    frame.f_lineno,
                                                    code))
    return trace_func

# The functions that we will be tracing

def do_multiply(a, b):
    return a * b

def do_add(a, b):
    c = a + b
    return do_multiply(a, c)


sys.settrace(trace_func)

do_add(1,3)

sys.settrace(None)
```

It'll output:

```bash
Event: call  Func: do_add, Line: 22, raw_code: def do_add(a, b):
Event: line  Func: do_add, Line: 23, raw_code: c = a + b
Event: line  Func: do_add, Line: 24, raw_code: return do_multiply(a, c)
Event: call  Func: do_multiply, Line: 19, raw_code: def do_multiply(a, b):
Event: line  Func: do_multiply, Line: 20, raw_code: return a * b
Event: return  Func: do_multiply, Line: 20, raw_code: return a * b
Event: return  Func: do_add, Line: 24, raw_code: return do_multiply(a, c)
```
{% endraw %}

<br/>

## How to track local variable changes within python sys.settrace() 

{% raw %}
```python
import sys
from types import FrameType
import traceback

# trace function to print every frame event, the function name, the line and the 
# raw code of that line and local the local variables
def trace_func_local_vars(frame: FrameType, event, arg):
    stack = traceback.extract_stack(limit=2)
    code = traceback.format_list(stack)[0].split('\n')[1].strip()  # gets the source code of the line
    _locals = frame.f_locals
    print("Event: {0}  Func: {1}, Line: {2}, raw_code: {3}, local_vars: {4}".format(event, 
                                                    frame.f_code.co_name,
                                                    frame.f_lineno,
                                                    code, _locals))
    return trace_func_local_vars

def do_multiply(a, b):
    return a * b

def do_add(a, b):
    c = a + b
    return do_multiply(a, c)


sys.settrace(trace_func_local_vars)

do_add(1,3)

sys.settrace(None)
```

Outputs:

```bash
Event: call  Func: do_add, Line: 20, raw_code: def do_add(a, b):, local_vars: {'a': 1, 'b': 3}
Event: line  Func: do_add, Line: 21, raw_code: c = a + b, local_vars: {'a': 1, 'b': 3}
Event: line  Func: do_add, Line: 22, raw_code: return do_multiply(a, c), local_vars: {'a': 1, 'b': 3, 'c': 4}
Event: call  Func: do_multiply, Line: 17, raw_code: def do_multiply(a, b):, local_vars: {'a': 1, 'b': 4}
Event: line  Func: do_multiply, Line: 18, raw_code: return a * b, local_vars: {'a': 1, 'b': 4}
Event: return  Func: do_multiply, Line: 18, raw_code: return a * b, local_vars: {'a': 1, 'b': 4}
Event: return  Func: do_add, Line: 22, raw_code: return do_multiply(a, c), local_vars: {'a': 1, 'b': 3, 'c': 4}
```
{% endraw %}

**Pros**
- You don't need to modify your function behavior in order to track execution
- You can gain highly accurate debugging information throughout your python function(s) executions
- Easy and simple to implement

**Cons**
- It does some with caveats
- complicated to filter and choose what to track especially when you use other python library and you don't their execution to be tracked

<br/>

## Important Caveats of sys.settrace() to be aware of

- You might not be able to use your IDEs debugger if you are assigning your trace function to sys.settrace(). This is definitely true for Pycharm
- If you are logging a function that executes function of other libraries, this may generate loads of events, so be careful with the type of events that you are logging.

<br/>

## Conclusion

Overall, I would personally go with the settrace() solution as it is more of a plug and play and I think there are ways to work around the complexity of having to filter events and certain functions from being tracked. I am currently working on another post to do with this.

**Notes**:
- [https://stackoverflow.com/questions/32277172/sys-settrace-only-getting-called-at-function-calls-not-every-line](https://stackoverflow.com/questions/32277172/sys-settrace-only-getting-called-at-function-calls-not-every-line)
- [https://explog.in/notes/settrace.html](https://explog.in/notes/settrace.html)
- [https://www.geeksforgeeks.org/python-sys-settrace/](https://www.geeksforgeeks.org/python-sys-settrace/)
- [https://docs.python.org/3/library/sys.html](https://docs.python.org/3/library/sys.html)

<br>