---
layout: post
title: How to SSH into a private container within your server
subtitle: Introducing SSH Bastion
comments: true
show-avatar: false
tags: [ssh, bastion, linux]
---

*Picture this:*

You have a **server (IP: 192.168.1.20)** and you are able to access/ssh into this server through your PC.

Inside the server, you have some container virtualization system, e.g. Docker. In my case I am using [LXD](https://linuxcontainers.org/lxd/introduction/) (Linux Containers).

You have a **container(IP: 10.0.12.100)**.

You wan't to SSH to this container from your laptop, but realise you can't even ping them!

<br>

**THE SOLUTION --- forward SSH Connection using the SSH Bastion Concept**

![ssh-bastion](/img/ssh-bastion-host.png)
src: [https://blog.scottlowe.org/2015/11/21/using-ssh-bastion-host/](https://blog.scottlowe.org/2015/11/21/using-ssh-bastion-host/)

<br>

### It's EASY - Take my money!

Instead of the usual:
```bash
# ssh user@<the ip of the instance you want to connect to>
```

You add another ssh argument called "proxycommand" (but it'll ask you for authentication): 
```bash
# ssh user@<ip of private instance> -o "proxycommand ssh -W %h:%p user@<ip of server>"
ssh user@10.0.12.100 -o "proxycommand ssh -W %h:%p user@192.168.1.20"
```

To settle the SSH Authentication, add the SSH Keypair:
```bash
ssh -i ~/.ssh/id_rsa user@10.0.12.100 -o "proxycommand ssh -W %h:%p -i ~/.ssh/id_rsa user@192.168.1.20"
```

<br>


### A Better approach

Now, do we really want to have to type all that proxycommand stuff everytime we SSH to the instance? (I hope your answer is **NO**).

The above command will work but if you want a much better solution, it would be better if you didn't have to use a long command: 
```bash
# ssh user@<private container host>
ssh user@10.0.12.100
```

First setup the SSH config (*in your .ssh folder /home/user/.ssh/config*) so that we can connect to server_one: 
```
Host server_one
    Hostname 192.168.1.20
    User user
    IdentityFile  ~/.ssh/id_rsa
```

Then add another entry for forwarding connections within 10.0.12.* range to the correct private instances inside server_one:
```
Host server_one
    Hostname 192.168.1.20
    User user
    IdentityFile  ~/.ssh/id_rsa
Host 10.0.12.*
    IdentityFile  ~/.ssh/id_rsa
    User user
    ProxyCommand ssh -W %h:%p  user@server_one
```

So now when you run:
```bash
# it's equivalent to running
# ssh -i ~/.ssh/id_rsa user@10.0.12.100 -o "proxycommand ssh -W %h:%p -i ~/.ssh/id_rsa user@192.168.1.20"

ssh user@10.0.12.100
```

{:.box-warning}
Note that with the setup we have above the shh forward connection will automatically be applied to IP ranges: 10.0.12.0 - 10.0.12.255. <br>
```ssh user@10.0.12.[0-225]``` <br>
This will prevent you from doing a "normal" SSH connection to those IP ranges. However, there is a solution to this: On the next tutorial (still in progress)

<br>

### Conclusion

I hope this helps!

Here's a list of other useful links:
- [https://medium.com/@williamtsoi/convenient-ssh-proxying-through-a-bastion-host-cef9eb832100](https://medium.com/@williamtsoi/convenient-ssh-proxying-through-a-bastion-host-cef9eb832100)
- [https://blog.scottlowe.org/2015/11/21/using-ssh-bastion-host/](https://blog.scottlowe.org/2015/11/21/using-ssh-bastion-host/)
- [https://blog.scottlowe.org/2016/09/13/ssh-bastion-host-follow-up/](https://blog.scottlowe.org/2016/09/13/ssh-bastion-host-follow-up/)
- [https://myopswork.com/transparent-ssh-tunnel-through-a-bastion-host-d1d864ddb9ae](https://myopswork.com/transparent-ssh-tunnel-through-a-bastion-host-d1d864ddb9ae)

John