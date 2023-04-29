---
layout: post
title: Build an Android SDK/Build Tools/Appium docker container with DockerFile from scratch
comments: true
subtitle: This guide teaches you how to setup a container from SCRATCH for android mobile automation testing using a custom Dockerfile (without relying on other docker builds)
show-avatar: false
tags: [visual studio code, vscode, android sdk, android build tools, android platform tools, docker, appium, appium-docker-image, Dockerfile]
---


In this guide we look at how to **build a docker container for mobile testing/automation using a dockerfile**.

One of the problems I've encountered so far when it comes to setting up a docker environment for mobile automation and testing is that I have **not been able to find a docker image that works for me**.

Meaning to say that either they don't work out of the box as expected for me (due to some bug, or I'm just an absolute noob that can't figure it out) OR they contain a lot of features that may confuse, intimidate or distract me (believe me, this happens a lot...)

Here are a couple of them:
- [thyrlian/android-sdk](https://hub.docker.com/r/thyrlian/android-sdk)
- [budtmo/docker-android](https://github.com/budtmo/docker-android)

Don't get me wrong, these are some very repos to help you with getting started. In fact, they are feature-packed! 

**Advantage of setting up your own Dockerfile**
- You can tailor it to your own requirements
- It's easy to set up and test different versions of Android SDK or Appium since you just need to tweak the dockerfile 



**Pre-requisites**
- [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) - I've got this setup on Linux Ubuntu, but set it up however it fits for you


<br/>


## TLDR - The Complete DockerFile

Actually **all you need** to get started is found in the official [Appium Repo](https://github.com/appium/appium-docker-android/blob/master/Appium/Dockerfile), and then we tweak it. In order to use this version you'd need to clone the repo and build it from their DockerFile.

**However**, For my use case I **don't need** all the other useful scripts that come with the repo since I am going to be plugging this DockerFile in my own repo. I just need **parts of** the DockerFile script for **installing Android SDK & Build Tools and Appium**

This DockerFile is highly customizable, but for this Example we will use:
- Docker's Ubuntu 18 as the base
- The default, SDK version 25 
- Appium v1.22.3
- Latest NodeJS and NPM

If you want an explanation of how the Dockerfile works, read further. But before that, credits to [Appium Repo](https://github.com/appium/appium-docker-android/blob/master/Appium/Dockerfile) for creating and maintaing the original dockerfile script for this. 

{% raw %}

```dockerfile
FROM ubuntu:18.04



#=============
# Set WORKDIR
#=============
WORKDIR /dev

#==================
# General Packages
#------------------
# openjdk-8-jdk
#   Java
# ca-certificates
#   SSL client
# tzdata
#   Timezone
# zip
#   Make a zip file
# unzip
#   Unzip zip file
# curl
#   Transfer data from or to a server
# wget
#   Network downloader
# libqt5webkit5
#   Web content engine (Fix issue in Android)
# libgconf-2-4
#   Required package for chrome and chromedriver to run on Linux
# xvfb
#   X virtual framebuffer
# gnupg
#   Encryption software. It is needed for nodejs
#==================
RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install \
    openjdk-8-jdk \
    ca-certificates \
    tzdata \
    zip \
    unzip \
    curl \
    wget \
    libqt5webkit5 \
    libgconf-2-4 \
    xvfb \
    gnupg \
  && rm -rf /var/lib/apt/lists/*

#===============
# Set JAVA_HOME
#===============
ENV JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/jre" \
    PATH=$PATH:$JAVA_HOME/bin

#=====================
# Install Android SDK
#=====================
ARG SDK_VERSION=sdk-tools-linux-3859397
ARG ANDROID_BUILD_TOOLS_VERSION=26.0.0
ARG ANDROID_PLATFORM_VERSION="android-25"

ENV SDK_VERSION=$SDK_VERSION \
    ANDROID_BUILD_TOOLS_VERSION=$ANDROID_BUILD_TOOLS_VERSION \
    ANDROID_HOME=/root

RUN wget -O tools.zip https://dl.google.com/android/repository/${SDK_VERSION}.zip && \
    unzip tools.zip && rm tools.zip && \
    chmod a+x -R $ANDROID_HOME && \
    chown -R root:root $ANDROID_HOME

ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin

# https://askubuntu.com/questions/885658/android-sdk-repositories-cfg-could-not-be-loaded
RUN mkdir -p ~/.android && \
    touch ~/.android/repositories.cfg && \
    echo y | sdkmanager "platform-tools" && \
    echo y | sdkmanager "build-tools;$ANDROID_BUILD_TOOLS_VERSION" && \
    echo y | sdkmanager "platforms;$ANDROID_PLATFORM_VERSION"

ENV PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools

#====================================
# Install latest nodejs, npm, appium
# Using this workaround to install Appium -> https://github.com/appium/appium/issues/10020 -> Please remove this workaround asap
#====================================
ARG APPIUM_VERSION=1.22.3
ENV APPIUM_VERSION=$APPIUM_VERSION

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash && \
    apt-get -qqy install nodejs && \
    npm install -g appium@${APPIUM_VERSION} --unsafe-perm=true --allow-root && \
    exit 0 && \
    npm cache clean && \
    apt-get remove --purge -y npm && \
    apt-get autoremove --purge -y && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    apt-get clean

#==================================
# Fix Issue with timezone mismatch
#==================================
ENV TZ="US/Pacific"
RUN echo "${TZ}" > /etc/timezone

#===============
# Expose Ports
#---------------
# 4723
#   Appium port
#===============
EXPOSE 4723

#==================================================
#
# This is where you add your entry point or command 
#
# Note: Also add your commands for copying
#       your repo files over
#
#==================================================

```
{% endraw %}

<br/>

## Adding Android SDK and ADB (Explanation)
If the download link on this DockerFile example is out of date, this is the page to look for the download link to the [Android CLI tools](https://developer.android.com/studio/index.html#command-line-tools-only)
 
### Installing JAVA
We use Java's ```open-jdk-8``` and set ```$JAVA_HOME```, whilst also installing other useful packages:

{% raw %}
```dockerfile
RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install \
    openjdk-8-jdk \
    ca-certificates \
    tzdata \
    zip \
    unzip \
    curl \
    wget \
    libqt5webkit5 \
    libgconf-2-4 \
    xvfb \
    gnupg \
  && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/jre" \
    PATH=$PATH:$JAVA_HOME/bin
```
{% endraw %}


### Installing Android SDK and Build Tools

We download the Android sdk cli tools since we don't need android studio, and then we use ```sdkmanager``` to install a specific version of the ```Android SDK```, ```Android platform tools``` and ```Android build tools```. Lastly, we set ```$ANDROID_HOME```.

{% raw %}
```dockerfile
ARG SDK_VERSION=sdk-tools-linux-3859397
ARG ANDROID_BUILD_TOOLS_VERSION=26.0.0
ARG ANDROID_PLATFORM_VERSION="android-25"

ENV SDK_VERSION=$SDK_VERSION \
    ANDROID_BUILD_TOOLS_VERSION=$ANDROID_BUILD_TOOLS_VERSION \
    ANDROID_HOME=/root

RUN wget -O tools.zip https://dl.google.com/android/repository/${SDK_VERSION}.zip && \
    unzip tools.zip && rm tools.zip && \
    chmod a+x -R $ANDROID_HOME && \
    chown -R root:root $ANDROID_HOME

ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin

# https://askubuntu.com/questions/885658/android-sdk-repositories-cfg-could-not-be-loaded
RUN mkdir -p ~/.android && \
    touch ~/.android/repositories.cfg && \
    echo y | sdkmanager "platform-tools" && \
    echo y | sdkmanager "build-tools;$ANDROID_BUILD_TOOLS_VERSION" && \
    echo y | sdkmanager "platforms;$ANDROID_PLATFORM_VERSION"

ENV PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools
```

{% endraw %}


<br/>

## Installing Appium Server (Explanation)
If you want to install a different version, look for a different release version in [appium's apm npm package page](https://www.npmjs.com/package/appium?activeTab=versions).

{% raw %}
```dockerfile
ARG APPIUM_VERSION=1.22.3
ENV APPIUM_VERSION=$APPIUM_VERSION

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash && \
    apt-get -qqy install nodejs && \
    npm install -g appium@${APPIUM_VERSION} --unsafe-perm=true --allow-root && \
    exit 0 && \
    npm cache clean && \
    apt-get remove --purge -y npm && \
    apt-get autoremove --purge -y && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    apt-get clean
```
{% endraw %}

<br/>

## Using the DockerFile to build your container and deploy or debug you appium project

To Build and run the container, just do the typical docker command:
```bash
docker build -t appium-docker-img .
docker run -it --name appium-docker appium-docker-img
```

You can specify these build arguments:
- ANDROID_BUILD_TOOLS_VERSION
- APPIUM_VERSION
- SDK_VERSION

**IMPORANT**

Remember this is just a "barebones" setup, it's up to you how you want to run and execute these services together. For me personally I need to run this container in 2 ways:
- **Debugging** - when the container runs, connect to the adb device and start appium but don't start my appium code. Instead run this container as [dev container](https://code.visualstudio.com/docs/devcontainers/containers) which will allow me to debug my Appium testing/automation code whilst building the container in accordance to our DockerFile.
- **Live** - use a startup.sh script to run all adb, appium and my appium testing code upon container start.  

Anyways, I hope you find this helpful!