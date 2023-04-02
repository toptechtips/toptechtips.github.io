---
layout: post
title: How to profile your python function for debugging | Python settrace & setprofile
comments: true
subtitle: 
show-avatar: false
tags: [python, settrace, setprofile, debugging]
---



Perquisites:
- Python 3


I've always loved using PyCharm's debugging capabilities when it comes to debugging my Python program. The problem I run to nowadays, is that I have a program that I want to run continuously, but I cannot be there to monitor it continuously. Now you'll say "can't you just do some logging" to which I have tried previously and in my opinion, is only half the answer. My typical logging methodology would be logging at the start of a function "start of function 1" and adding another log at exception "failed to do x y z" or at the end saying "end function 1". I realized that this was not enough. What I wanted wasn't just your typical "logging", What I wanted was the ability to **completely trace a function's execution**, and then log that.

Upon much research, the only way to really do that without having to dive too deeply into some random rabbit hole is by using python's settrace (or setprofile) capabilities.


### A simple tracing function, to trace each event of function execution



Caveats (IMPORTANT!!):
- can't enable this if you are running Pycharm debug (which is fine since Pycharm debug achieves the same purpose)
- If you are logging a function that executes function of other libraries, this may generate loads of events, so be careful with the type of events that you are logging.



### Tracing local vars 

Caveats (IMPORTANT!!):
- beware of recursions