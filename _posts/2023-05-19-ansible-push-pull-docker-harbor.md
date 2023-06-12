---
layout: post
title: Ansible Docker Harbor Guide - Push/Pull Images & Harbor Setup
comments: true
subtitle: In this guide we learn how to push and pull images in docker harbor using ansible as well as setting up harbor using an ansible role
show-avatar: false
toc: true
tags: [docker, ansible, harbor]
---

In this guide we learn how one can interface with [Harbor](https://goharbor.io/) which is open source registry. In this particular use case we can use Harbor as our own private registry for our own docker images.  

**Pre-Requisites**
- Docker & Docker Compose 
- Ansible
- [Ansible Docker collection](https://galaxy.ansible.com/community/docker) (For Ansible Docker & Docker Compose roles)

NOTE: For this example, I have Docker Compose v2 installed and will be installing harbor v2.6.0 since that is compatible with v2 of docker compose. 

<br/>

## Setting Up Harbor - Method 1, with pre-made docker images

There is already a pre-made docker image by [bitnami](https://hub.docker.com/r/bitnami/harbor-registry)

just run this on the server that you want to install harbor on (you can find the instruction on the link):

{% raw %}
```bash
docker pull bitnami/harbor-registry
mkdir harbor
curl -LO https://raw.githubusercontent.com/bitnami/containers/main/bitnami/harbor-portal/docker-compose.yml
curl -L https://github.com/bitnami/containers/archive/main.tar.gz | tar xz --strip=2 containers-main/bitnami/harbor-portal && cp -RL harbor-portal/config . && rm -rf harbor-portal
docker-compose up -d
```
{% endraw %}

**IMPORTANT**: the admin password is "bitnami" but can also be found in the downloaded docker-compose.yml file, in the "core" service, the environment variable is named: "HARBOR_ADMIN_PASSWORD=bitnami"

You still need to configure this harbor setup and have it use HTTPS!

<br/>

## Setting Up Harbor - Method 2, with Ansible
If you already have Harbor, then skip this step.

**Pre-Requisites**
- [Ansible Harbor Role](https://galaxy.ansible.com/one_mind/harbor_ansible_role) (Optional, for setup of harbor via ansible)

We will be using this [harbor Ansible role](https://galaxy.ansible.com/one_mind/harbor_ansible_role) so make sure to install it. 

> NOTE: There is another Ansible harbor role with more downloads, but the role is outdated and uses older docker community roles/collections

Ansible playbook to setup harbor.
{% raw %}
```yaml
- hosts: localhost
  connection: local
  roles:
      - one_mind.harbor_ansible_role
  become: true
  vars:
    harbor_version: "v2.6.0" # I'm using docker V2 so I need to use this version of harbor
    harbor_hostname: "192.168.0.250"
    harbor_admin_password: "test"
    harbor_db_password: "test"
```
{% endraw %}


> NOTE: This is only for setting up harbor, it'll probably fail setting up users or projects, but I will manually create users and a project on the Harbor UI since I was having issues getting the role to work. Maybe it only works up to a certain version of Harbor.


### Some issues I ran into using the Ansible Harbor Role 

**docker compose version**

You might run into an issue during Harbor installation where you have docker compose installed on your server, but the script is not detecting that you have docker compose installed. For the solution to this, look at this StackOverflow [answer](https://stackoverflow.com/questions/70833038/habor-installer-thinks-docker-compose-is-not-installed). I installed harbor v2.6.0 since that works with the version of docker compose that I am using - v2. This issue was noticed [here](https://github.com/goharbor/harbor/issues/17540).

**docker python sdk**

This role uses the [Ansible docker compose module](https://docs.ansible.com/ansible/latest/collections/community/docker/docker_compose_module.html) so make sure to meet the requirements of that module. For me, I had to install the ```docker``` and ```docker-compose``` python modules on the server that will be running harbor 

**permissions**

I also had to run this module with ```become: true```

**important role vars to set**

NOTE: Make sure to modify the following role vars: ```harbor_hostname```, ```harbor_admin_password```, ```harbor_db_password```

At this point I gave up with the rest of the role's functionality and just settled for successfully installing Harbor. I can set up the users projects myself. Honestly I'm pretty sure if I just install a slightly older version of harbor and docker compose on the server, this role would probably work.

**IMPORTAT**: You still need to set up harbor for HTTPS or else your harbor registry will be insecure. The docker login module in the next step works with a secured registry.

<br/>

## Logging into Harbor with Ansible

<br/>

## Pushing your image to Harbor with Ansible

<br/>

## Pulling your image to Harbor with Ansible

<br/>

## Other ways to push to Harbor

<br/>

### Using docker compose