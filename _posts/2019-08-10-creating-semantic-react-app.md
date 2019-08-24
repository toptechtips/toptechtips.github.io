---
layout: post
title: How I finally managed to create a React based semantic-ui app in 2019
comments: true
show-avatar: false
tags: [web development, reactjs, semantic ui, npm, node, gulp, craco, less]
---


It's **August 2019** and I want to work on my incomplete [Protfolio Website](https://johncalzado1.github.io). However, I thought that instead of continuing development on it using semantic-ui, I would experiment with Semantic-UI's ReactJS integration. I figured this was also a good opprotunity to have more practice with ReactJS based on [my last weekend project.](/2019-07-20-first-react-site/)


## I wanted to try and install Semantic UI (not React-based) | You DON'T have to do this to use SemanticUI React

First I wanted to try installing a fresh version of semantic ui as the version my portfolio was using is an older version.

## To install semantic UI I needed to install the following (in the time of writing):
- Node (v6)
- NPM
- Gulp (v3.9.1, wasn't getting success with versions above)

When installing node I suggest using [nvm](https://github.com/nvm-sh/nvm) as it allows you to install different versions of node with ease.

{: .box-warning}
Note: It's important to install the correct versions of these programs as some version don't work with others. *I Learnt this the hard way*. This is also why I recommend using nvm as it allows you to switch between node versions (and NPM versions) quickly and easily.
<br><br>
**From what I have seen, node version 8-12 (along with their npm versions that they come with) don't work well with Gulp v4 (latest)**

After this I could then install semantic-ui:

```bash
npm install semantic-ui --save
cd semantic/
gulp build
```

## Installing Semantic UI React Integration (with Default Theme)

The official site for Semantic UI's React integration is found [here](https://react.semantic-ui.com/).

Now the standard procedure is:
1. Create a react app
2. install semantic-ui-react package
3. Add a semantic-ui theme (default or custom)

If we wanted to create our app with the default theme, we can do this:

```bash
npx create-react-app my-app
cd my-app
npm start
yarn add semantic-ui-react
yarn add semantic-ui-css
```
and then in ```index.js``` of your react app, add the line:

```js
import 'semantic-ui-css/semantic.min.css'
```

{: box-warning}
According to ReactJS docs you must ensure that you have Node >= 8.10 and npm >= 5.6 installed (If you followed last section and installed semantic-ui with node 6, now is your chance to run: ```nvm use 8``` to switch to node version 8 and npm version 6).

## Installing Semantic UI React Integration with custom theme (LESS)

In the last section, we use the default semantic-ui theme. However, what if we wanted our own customizable theme? Semantic UI React's docs talks about using [craco-less](https://www.npmjs.com/package/craco-less) which allows how to configure Semantic UI's theme with [LESS](http://lesscss.org/).

You're supposed to follow [these steps](https://react.semantic-ui.com/theming/) if you want to create a semantic ui react app but with custom theming.


## A Silly Mistake with NVM // The Solution
So I follow the steps above and I struggled to get the [theming](https://react.semantic-ui.com/theming/) part to work.

I kept runnning into this error (and some other errors, but this was the common one):

```
yarn run v1.17.3
$ craco start
/home/user/jc/portfolio/node_modules/@craco/craco/lib/features/dev-server.js:14
                ...context,
                ^^^

SyntaxError: Unexpected token ...
    at createScript (vm.js:56:10)
    at Object.runInThisContext (vm.js:97:10)
    at Module._compile (module.js:549:28)
    at Object.Module._extensions..js (module.js:586:10)
    at Module.load (module.js:494:32)
    at tryModuleLoad (module.js:453:12)
    at Function.Module._load (module.js:445:3)
    at Module.require (module.js:504:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/user/jc/portfolio/node_modules/@craco/craco/scripts/start.js:7:31)
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.

```

I suggested using NVM to manage your node versions. However, I made a ***typical rookie mistake*** of not ensuring that the packages I installed are running on the version of node I am using. To solve this I had to:

- switch to node 8: ```nvm use 8```
- used yarn to install the dependancies (not npm): ```yarn add @craco/craco craco-less semantic-ui-less --dev``` (This was due to permission errors using npm and I didn't want to fiddle with that. Also because the npm version changes when I change the ndoe version as well...)

Then, check if the dependancies are installed:
```
yarn list @craco/craco craco-less semantic-ui-less
```

Output:
```
yarn list v1.17.3
warning Filtering by arguments is deprecated. Please use the pattern option instead.
├─ @craco/craco@5.3.0
├─ craco-less@1.12.0
└─ semantic-ui-less@2.4.1
Done in 0.75s.
```

Now, when I run ```yarn start```:

![](/img/semantic-react-ui.png)

We have a react app!


<br>

I Hope this helps, and thanks for reading this post,

John
