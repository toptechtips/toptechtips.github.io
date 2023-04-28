---
layout: post
title: (EASY) How to uninstall docker completely on Ubuntu
comments: true
subtitle: How to completely uninstall docker from your Ubuntu OS - packages, containers, volumes, images - EVERYTHING! 
show-avatar: false
tags: [docker, ubuntu, docker engine, linux]
---

Believe it or not, Docker is actually very easy to Uninstall.

For this example I am using Ubuntu 20.04.5 LTS, but this should work with any other version of Ubuntu.

## Step 1 - Uninstall All the docker packages:

{% raw %}
```bash
sudo apt-get purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
```
<br/>

## Step 2 - Delete all the other docker data like images, volumes, containers, configs as they don't get removed automatically in the first step

```bash
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

And with that, you've completely removed docker from your Ubuntu OS... It's that easy - I hope this helps!

**Resources:**
- [https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/)



{% endraw %}