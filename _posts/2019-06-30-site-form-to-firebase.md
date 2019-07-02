---
layout: post
title: Create a website form with a Firebase backend (free)
comments: true
show-avatar: false
tags: [firebase, firestore, web form, jekyll]
---

In this post, we look at how we can create a website form that pushes user input to a (Firebase) Database.

---

**_OK, so why can't I just use some other free online form services and embedded it to my website?_**
* Having your own form gives you a lot more **flexibility** in terms of form design and function.
* Firebase is **free** (and it's a Google service!) and very easy to integrate to your site.
* For static websites (e.g. Github Pages, Jekyll Sites, Hugo Sites) that **don't have a local database**, this allows user-input data to be stored and accessed outside of the site.

---

### What do we need to do?
Here's a quick diagram of what we're trying to achieve:


![firebase webform design](/img/firebase_webform.jpg)

<br>


#### 1. Create HTML form


<br>

#### 2. Create a Firebase project

To use Firebase, you need a google account. Head over to [Google Accounts](https://support.google.com/accounts/answer/27441?hl=en) (If you don't trust this link, just google: _"Create a google account"_).

- Go to [Firebase](https://firebase.google.com/).

![firebase landing page](/img/firebase_webform/firebase_langing.png)

- Click **"Get Started"**, Then **"Add Project"**.
- Enter a **project name** (For this exmaple I used, "test-project").
- Select the Analytics location, or leave it to its default value.

![firebase add project](/img/firebase_webform/add_project1.png)

And with that, your Firebase project is created.

<br>

#### 3. Create a Firebase Database for you project

You will now see your Project on your [Firebase Dashboard](https://console.firebase.google.com/).

- Click on your project to navigate to your project.
- On the **left side bar**, click on **Database**.
- On the Database page, click on **Create Database**.

![Firebase project](/img/firebase_webform/firebase_project2.png)

{: .box-warning}
**NOTE:** To keep things simple, we will enable test-mode so that we don't need authentication to push data to our database. Obviously, we would implement a more secure way to push data, but we will leave that for another post.

- Select the **Cloud Firestore Location**.

![Firebase add database](/img/firebase_webform/create_db1.png)

<br>

#### 4. Create a Firestore Collection
Firestore is the successor of the earlier version of Firebase so I will use the term "Firebase" and "Firestore" interchangibly.

- After you've created your database, navigate to it and click **"Add Collection"**



++++++++++DO THIS PART++++++++++++
- add collection ID
- add document fields



#### 5. Connect Firebase to website

<br>

### Conclusion
