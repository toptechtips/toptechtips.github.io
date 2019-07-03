---
layout: post
title: Create a website from with a Firebase backend (free)
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


### 1. Create HTML form


<br>

### 2. Create a Firebase project

To use Firebase, you need a google account. Head over to [Google Accounts](https://support.google.com/accounts/answer/27441?hl=en) (If you don't trust this link, just google: _"Create a google account"_).

- Go to [Firebase](https://firebase.google.com/).

![firebase landing page](/img/firebase_webform/firebase_langing.png)

- Click **"Get Started"**, Then **"Add Project"**.
- Enter a **project name** (For this exmaple I used, "test-project").
- Select the Analytics location, or leave it to its default value.

![firebase add project](/img/firebase_webform/add_project1.png)

And with that, your Firebase project is created.

<br>

### 3. Create a Firebase Database for you project

You will now see your Project on your [Firebase Dashboard](https://console.firebase.google.com/).

- Click on your project to navigate to your project.
- On the **left side bar**, click on **Database**.
- On the Database page, click on **Create Database**.

![Firebase project](/img/firebase_webform/firebase_project2.png)

{: .box-warning}
**NOTE:** To keep things simple, we will enable test-mode so that we don't need authentication to push data to our database. Obviously, we would implement a more secure way to push data, but we will leave that for another post.

- Select the **Cloud Firestore Location**.

![Firebase add database](/img/firebase_webform/create_db1.png)

#### Create a Firestore Collection (Optional)
Firestore is the successor of the earlier version of Firebase so I will use the term "Firebase" and "Firestore" interchangibly.

You can create a collection yourself, by clicking "Add Collection" and adding some fields. But for this post, we don't need to as Firebase allows us push data without any sort of Collection definition/mappings to be defined.

<br>


### 4. Connect Firebase to website

Next we need to actually connect our Firebase database to our website.
- Navigate to **Project Settings** (the cog icon on the left side bar).
- **Add an app** - Click on the code icon (looks like this "</>").
- Enter an **app nickname** (for this example, we use test-site).
- Firebase will then generate some Javascript code for you to add to your website:

```javascript
<!-- The core Firebase JS SDK is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/6.2.4/firebase-app.js"></script>

<!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#config-web-app -->

<script>
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "<__YOUR_API_KEY__>",
    authDomain: "<__YOUR_AUTH_DOMAIN__>",
    databaseURL: "<__YOUR_DATABASE_URL__>",
    projectId: "<__YOUR_PROJECT_ID__>",
    storageBucket: "<__YOUR_STORAGE_ID__>",
    messagingSenderId: "<__YOUR_MESSAGING_SENDER_ID__>",
    appId: "<__YOUR_APP_ID__>"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
</script>
```

{: .box-warning}
Note that the javascript libraries in the generted script are CDN-based. You can change them if you wish to save the Firebase libraries locally.


<br>

### Conclusion
