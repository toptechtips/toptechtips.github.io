---
layout: post
title: (SOLVED) VSCode SFTP SSH Authentication Error in Linux 
comments: true
subtitle: This guide aims to give a variety of solutions to the ssh authentication error that you might come across when using VSCode'#'s SFTP extension   
show-avatar: false
tags: [visual studio code, vscode, sftp, remote ssh, vscode extensions, Linux]
---

When using the VScode SFTP extension by [Natizyskunk](https://github.com/Natizyskunk/vscode-sftp), you may run into issues when using it if you have set up the extension to use SSH.

**Prerequisites**
- **Linux OS** - I used Ubuntu in this example, but it should be the same across other Linux OS.
- **You can SSH to your remote server in some way** - You have SSH client installed on your remote server and an SSH agent installed on your local machine.

<br/>

## TLDR
If you're in a hurry, look into the config options on the extension docs: [https://github.com/Natizyskunk/vscode-sftp/wiki/SFTP-only-Configuration](ttps://github.com/Natizyskunk/vscode-sftp/wiki/SFTP-only-Configuration) and just keep adding the different configs until something works.

<br/>

## Example SFTP config with SSH that was throwing an Authentication Error

This is an example vscode SFTP config file which connects to the remote server "docker-server" by using JUST the **private key** config.

*NOTE: I don't have any ```passphrase``` and I have added my ```public key``` to my remote machine's list of ```authorized_keys```. I also have an ```ssh config file setup``` so that I can easily SSH to my remote server without having to type any password.*

SFTP config file inside my project (```sftp.json```):

{% raw %}
```json
{
    "name": "docker-server", 
    "host": "docker-server",  // Can also be an IP
    "protocol": "sftp", 
    "port": 22,
    "username": "user", 
    "remotePath": "/home/user/dev",
    "uploadOnSave": true,
    "useTempFile": false,
    "openSsh": true,
    "privateKeyPath": "/home/user/.ssh/id_rsa" 
} 
```
{% endraw %}

It results in:

![sftp-error](/img/vscode-sftp/error.png)

This result is quite vague, but we just need to figure out what config we need to add to help SFTP connect to our remote server *(assuming there really is no authentication error outside VSCode)*.

<br/>

## Solution #1 - Specify the SSH agent
This one was really unexpected for me, but sometimes you may need to specify your SSH agent. To find out the path to your SSH agent, do:

{% raw %}
```bash
echo $SSH_AUTH_LOCK
```
{% endraw %}

![ssh-auth-lock](/img/vscode-sftp/ssh-auth-lock.png)

New config file:

{% raw %}
```json
{
    "name": "docker-server", 
    "host": "docker-server",  // Can also be an IP
    "protocol": "sftp", 
    "port": 22,
    "username": "user", 
    "remotePath": "/home/user/dev",
    "uploadOnSave": true,
    "useTempFile": false,
    "openSsh": true,
    "privateKeyPath": "/home/user/.ssh/id_rsa", 
    "agent": "/run/user/1000/keyring/ssh"
} 
```
{% endraw %}

<br/>

## Solution #2 - Specify the SSH config path

New config file:

Sounds simple, but you might just need to explicitly specify your ssh config file path. For other cases I didn't have to do this even though the path to my ssh config file was the default standard e.g. ```/house/"your usename"/.ssh/config```.

{% raw %}
```json
{
    "name": "docker-server", 
    "host": "docker-server",  // Can also be an IP
    "protocol": "sftp", 
    "port": 22,
    "username": "user", 
    "remotePath": "/home/user/dev",
    "uploadOnSave": true,
    "useTempFile": false,
    "openSsh": true,
    "privateKeyPath": "/home/user/.ssh/id_rsa", 
    "agent": "/run/user/1000/keyring/ssh",
    "sshConfigPath": "/home/user/.ssh/config"
} 
```

{% endraw %}

<br/>

## Conclusion

If you've encountered some other errors when it comes to setting up SSH configs for SFTP, help others by sharing your experience in the comment section below - I'd also be curious to know!

**Resources**
- [https://stackoverflow.com/questions/46852476/visual-studio-code-sftp-extension-using-ssh-authentication](https://stackoverflow.com/questions/46852476/visual-studio-code-sftp-extension-using-ssh-authentication)
- [https://github.com/Natizyskunk/vscode-sftp/wiki/SFTP-only-Configuration](https://github.com/Natizyskunk/vscode-sftp/wiki/SFTP-only-Configuration)