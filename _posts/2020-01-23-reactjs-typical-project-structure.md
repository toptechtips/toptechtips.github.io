---
layout: post
title: How to structure your ReactJS based project
comments: true
show-avatar: false
tags: [reactjs, kibana, javascript, html, css, jsx]
---


> It's been a while since my last post. I've been experimenting and using ReactJS on one of my projects for quite some time now.
Whilst, I have no claims to be a ReactJS Expert, I'd like to share with you some important things I learnt. 


If you're still quite new to ReactJS development and stil figuring out how you would go about structuring your project, This guide will come in handy and may save you a lot of refactoring later down the line (especially as you're project grows more in features and functionality).

ReactJS focuses on a more Object Orientated Approach when it comes to development, unlike many traditionalx frontend frameworks. This allows your code to be more **modular** and **reusable**. However, this can lead to more complicated design and millions of files and folders.

However, as my current motto in this type of developement goes...
>More more files, less big files + instruction manual on how they all fit together. 
<br> Instead of... less files, big files


### Example Project

Say I want to create a one page reactJS App that gets the current time in EST using ```http://worldclockapi.com/``` and then displays it.

#### How I would structure the project:

```
context/
    |- time_store.js
views/
    |- home.js
components/ 
    |- clock.js
helpers/
    |- time_helper.js
globals.js
...css files/other styling files
...media files
index.js (default reactJS generated files)
app.js (default reactJS generated files)
```

**source code**: [simple-time-app](https://github.com/johncalzado1/simple-time-app)

```context/```: This folder we store all our Context related files (Consumer/Provider). Simply put it, a context is like a global store. "Context provides a way to pass data through the component tree without having to pass props down manually at every level" - ReactJS. In our example project, we use context to store the Time Data that we pull from the API, a function to pull data from the API, and a function return the Time Data to which ever components wants it.

```views/```: This folder we store all our views. Each view can consist of one of more component(s). The sole purpose of the view if to define how things will look like... *"...To define the view"* (we try to avoid defining logic related to a component/we try to minimize logic).

```components/```: This folder is used to store our components. Components are the building blocks that make up our app. In our simple clock app, we have a ```Clock``` component which is responsible for handling all the logic related to displaying time details and getting time details. In our exmaple project, the ```Clock``` component, has a button for interacting with the TimeContext *(time_store.js)* in order to get the Time Data and then display it.

```helpers/```: This folder contains all our helper files. each helper file is just a list of simple functions. In our project example, the *time_helper.js* consists of one function that pulls time data from the worldclockapi.com's rest API.

```globals.js```: This is like a config file basically. We use it all over the different parts of the app to store config related information. 

### Disclaimer 

Now using this file structure for a simple time displaying app might sound *super-over-the-top-complicated* but when we are working with a more complicated app with more functions or feature (e.g. a to-do list), this kind of abstraction and structuring will surely help!

<br>

Whether you decide to adopt this style of structuring, there is no right or wrong answer. As long as it serves it's purpose.

Thanks for Reading,

John