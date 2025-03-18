---
layout: post
title: (Tested 2025) Installing Magisk on Android x86 Emulator running on Proxmox 
comments: true
subtitle: A Guide on how you can root your android x86 emulator running on Proxmox VE by installing magisk v28.
show-avatar: false
toc: true
tags: [magisk, android x86, proxmox]
---


Installing [Magisk](https://github.com/topjohnwu/Magisk/) is usually **easy**... but **not so much** when installing it on an **Android x86 emulator**. After much trial and error I've figured out how to - it's quite easy with a few manual steps!


<br/>

## Pre-requisites & Setup
- [Android x86](https://www.android-x86.org/) emulator - I used android OS 9.0 running on Proxmox VE Hypervisor
- [Magisk apk](https://github.com/topjohnwu/Magisk/releases/) - I used v28 which was the latest version at the time of writing
- Linux OS (I used Ubuntu) with ``adb`` installed (for connecting to the emulator) - with some understanding of how to use adb

<br/>

### Before you Start

1. I have **not tested** this with Android x86 running on **Virtualbox**, but I don't see why it wouldn't work. However, [someone](https://github.com/shakalaca/MagiskOnEmulator) did write up a solution for it.

2. Make sure your android-x86 is **installed with read/write permissions** (done at the installation process of android x86). ![read-write](/img/rooting-android-x86/read-write-enable.png)

3. Whilst there are multiple solutions to this [1](https://github.com/shakalaca/MagiskOnEmulator). [2](https://github.com/HuskyDG/initrd-magisk/) that I tried, but I could not get them to work (maybe because it only works with VirtualBox or older versions of android x86?).

4. Supposedly due x86 being an **uncommon architecture** you can [expect bugs](https://www.reddit.com/r/Magisk/comments/q5997c/help_is_it_possible_to_install_magisk_modules_on/) (probably why I can't install some modules after I've installed Magisk).


<br/>


## 1. Install Tools on Linux

Install the following tools:
- ``android-tools-mkbootimg``
- ``abootimg``

```
sudo apt install android-tools-mkbootimg abootimg
```

<br/>

## 2. Connect your emulator via ADB

To find your device IP you can open the terminal on the emulator and type ``ip a``, mine was under``wlan0``

```
adb connect (ip of emulator):5555
```

The terminal emulator:

![read-write](/img/rooting-android-x86/terminal-emu.png)


![read-write](/img/rooting-android-x86/ip-a.png)


<br/>


## 3. Copy Boot files from Android x86 Folder

1. Create a folder in the android emulator:
```
adb -e shell "mkdir /data/local/tmp/root"
```

2. Mount the android x86 folder to that folder (you will **need Superuser permission** hence the ``su`` in the command)
```
adb -e shell "su -c 'mount /dev/block/sda1 /data/local/tmp/root'"
```

3. Navigate to the android x86 folder, and you will see the files we need to copy to your Linux environment (``ramdisk.img`` and ``kernel``). **Memorize the file paths** of these 2 files then copy them using ``adb pull``.
![android-x86-folder](/img/rooting-android-x86/android-x86-folder.png)
```
adb pull /data/local/tmp/root/android-9.0-r2/kernel
adb pull /data/local/tmp/root/android-9.0-r2/ramdisk.img
```

<br/>

## 4. Pack the Files
Run This command on your Linux environment where you store the copied ``ramdisk.img`` and ``kernel`` files, and it will output a ``boot.img`` file. 

We will copy this generated file back to the Emulator.

```
mkbootimg --kernel kernel --ramdisk ramdisk.img --output boot.img
```

<br/>

## 5. Install the Magisk App on the Emulator
Before we continue you need to **install the Magisk app** in order to **patch** the ``boot.img`` file.

Either download the [apk](https://github.com/topjohnwu/Magisk/releases/) to your computer and install it using the following command or install it via the emulator (Note at the time of writing v28 was the latest version). 

```
adb install magisk.apk  
```

**Open the Magisk app** and it **enable Superuser** permissions:

![magisk-su](/img/rooting-android-x86/magisk-su.png)

You will see that your emulator is **NOT rooted**:

![magisk-su](/img/rooting-android-x86/magisk-no-root.png)


<br/>

## 6. Patch the Boot File
1. Copy the ``boot.img`` to some folder on the emulator that can be **accessed easily** (I just copied it to the download folder)
```
adb push boot.img /sdcard/Download
```

2. Open the Magisk app and **click install** and find the ``boot.img`` and patch it 
![magisk-install-1](/img/rooting-android-x86/magisk-install-1.png)
![select-boot-img](/img/rooting-android-x86/select-boot-img.png)
![patching-boot](/img/rooting-android-x86/patching-boot.img)

3. Once done it will output some ```patch_boot.img``` file in the same folder you uploaded the ``boot.img`` from (for me, it will be in the Downloads folder. Note: I renamed mine to start with "emu-4", you don't need to do that)
![patched-boot](/img/rooting-android-x86/patched-boot.png)

Note: ignore the different file name on the output logs - I screenshotted the wrong emlulator I was working on. 


<br/>

## 7. Extract and Create New Boot Image
1. Copy the ``patch_boot.img`` (for my example mine was called ``magisk_patched-28100_eR3o7.img``) from the emulator to your Linux environment.
```
adb pull /sdcard/Download/magisk_patched-28100_eR3o7.img
```

2. Run this command to generate the new boot files from the ``patch_boot.img``.
```
abootimg -x magisk_patched-28100_eR3o7.img
```

3. The previous command will **generate 3 files**, **rename 2** the files: 
- ``zImage`` &#8594; ``kernel``
- ``initrd.img`` &#8594; ``ramdisk.img``

4. copy these 2 files to the temporary android x86 folder we created earlier
```
adb push kernel /sdcard/Download
adb push ramdisk.img /sdcard/Download   
```

5. connect to the emulator using adb shell and ``su`` 
```
adb shell
su
```
6. 
once SU into the adb shell copy the ``kernel`` and ``ramdisk.img`` files to the android x86 folder - Note: I **copied the old** ``kernel`` and ``ramdisk.img`` file into a folder called "old" as a backup in case something goes wrong.
```
cp /sdcard/Download/kernel /data/local/tmp/root/android-9.0-r2/
cp /sdcard/Download/ramdisk.img /data/local/tmp/root/android-9.0-r2/
```

7. **IMPORTANT** - make sure the **file permissions are the same as the previous files**
```
cd /data/local/tmp/root/android-9.0-r2/
chmod 644 kernel
chmod 644 ramdisk.img
```

8. unmount android x86 folder and remove the temporary folder we created in the emulator
```
adb -e shell "su -c 'umount /data/local/tmp/root'"
adb -e shell "rmdir /data/local/tmp/root"
```

<br/>

## 8. Open the Magisk App
When you open the Magisk APP you should be able to **see that a version of Magisk is now installed**. 

But note that **you may get a warning** about some problem as shown below. Personally I ignored them as I was able to root the emulator either way. 

**IMPORTANT NOTE** - You **might not be able to install some modules**, but your **emulator will still be rooted**. I tried installing some modules and ran into errors, but I was able to install [LSPosed](https://github.com/LSPosed/LSPosed).

![abnormal-state](/img/rooting-android-x86/abnormal-state.png)

![additiona-setup](/img/rooting-android-x86/additional-setup.png)

![rooted-enabled-home](/img/rooting-android-x86/rooted-enabled-home.png)

**NOTE** - If you want to install LSposed you need to enabled ``zygisk`` in the settings before installing the module

<br/>



**References**
- https://web.archive.org/web/20190630142221/https://asdasd.page/2018/02/18/Install-Magisk-on-Android-x86/
- https://xdaforums.com/t/guide-discussion-modifying-android-x86-rooted-with-magisk.4077477/
