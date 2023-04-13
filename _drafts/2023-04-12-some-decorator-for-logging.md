---
layout: post
title: How to track local vars of a function from outside - Python settrace & setprofile
comments: true
subtitle: What's the best way to inspect a functions execution without modifying the function itself
show-avatar: false
tags: [python, settrace, setprofile, debugging]
---

I've always loved using PyCharm's debugging capabilities when it comes to debugging my Python functions. The problem I run into nowadays, is that I have a program that I want to run continuously, but I cannot be there to monitor it continuously. Now you'll say *"can't you just do some logging"* to which I have tried previously and so far my logging has not been "detailed enough".

#### It all started with logging

My typical logging methodology would be logging at the start of a function "start of function 1" and adding another log at exception "failed to do x y z" or at the end saying "end function 1".

```python
def my_func():
    log("start of my func")
    try:
       outcome = do_something()
       log("my_func success: {0}".format(outcome))
        return True
    except Exception as e:
       log("Some error in my_func: {0}".format(e))
    return False
```

The problem I face when I use this method of implementing logging is that when I have a million functions and I have to manually write a log message for each, and manually include variables that I want to debug into the log message or something like that. This was such a painful thing to maintain and I would rather have something a little more generic that I can just plug to a function to basically more or less do all of this. What I wanted wasn't just your typical "logging", What I wanted was the ability to **completely trace a function's execution**, and then log that.

Upon much research, the only way to really do that without having to dive too deeply into some random rabbit hole is by using python's settrace (or setprofile) capabilities. Which to be honest can be a bit of a mess itself if you're not careful of how you use it, but it is quite powerful

**Perquisites:**

- Python 3

### Enter Python's sys.settrace

We use Python's tracing capabilities to trace all sorts of events: 'call', 'line', 'return', 'exception' or 'opcode'. More Detail about them ![here](https://docs.python.org/3/library/sys.html#sys.settrace)

### A simple tracing function, to trace each event of function execution

For this first example, we simply trace EVERY event and print the event name, function name, line number and the source code of that line!

{% raw %}
```python
import sys
from types import FrameType
import traceback

def trace_func(frame: FrameType, event, arg):
    stack = traceback.extract_stack(limit=2)
    code = traceback.format_list(stack)[0].split('\n')[1].strip()  # gets the source code of the line

    
    print("Event: {0}  Func: {1}, Line: {2}, raw_code: {3}".format(event, 
                                                    frame.f_code.co_name,
                                                    frame.f_lineno,
                                                    code))
    return trace_func

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

Caveats (IMPORTANT!!):

- can't enable this if you are running Pycharm debug (which is fine since Pycharm debug achieves the same purpose)
- If you are logging a function that executes function of other libraries, this may generate loads of events, so be careful with the type of events that you are logging.

### Tracing local vars

Caveats (IMPORTANT!!):

- beware of recursions

Notes:
- https://stackoverflow.com/questions/32277172/sys-settrace-only-getting-called-at-function-calls-not-every-line
- https://explog.in/notes/settrace.html
- https://www.geeksforgeeks.org/python-sys-settrace/