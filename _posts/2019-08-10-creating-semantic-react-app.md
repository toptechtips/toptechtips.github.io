---
layout: post
title: How I finally managed to create a React based semantic-ui app in 2019
comments: true
show-avatar: false
tags: [web development, reactjs, semantic ui, npm, node, gulp, craco, less]
---

__Post still under construction__


I wanted to work on my incomplete [Protfolio Website](https://johncalzado1.github.io). However, I thought that instead of continuing development on it using semantic-ui, I would experiemnt with Semantic-UI's ReactJS integration. I figured this was also a good opprotunity to have more practice with ReactJS based on [my last weekend project.](/2019-07-20-first-react-site/)


# Step one, trying to install the normal Semantic UI
First I wanted to try installing a fresh version of semantic ui as the version my portfolio was using is an older version.

## To install semantic UI I needed to install the following (in the time of writing):
- Node (v6)
- NPM
- Gulp (v3.9.1, wasn't getting success with versions above)

When installing node I suggest using [nvm](https://github.com/nvm-sh/nvm) as it allows you to install different versions of node with ease.

{: .box-warning}
Note: It's important to install the correct versions of these programs as some version don't work with others. *I Learnt this the hard way*. This is also why I recommend using nvm as it allows you to switch between node versions (and NPM versions) quickly and easily.
<br><br>
**From what have seen node version 8-12 (along with their npm versions that they come with) don't work well with Gulp v4 (latest)**

After this I could then install semantic-ui:

```bash
npm install semantic-ui --save
cd semantic/
gulp build
```

## Installing Semantic UI React Integration

The official site for Semantic UI's React integration is found [here](https://react.semantic-ui.com/).

Now the standard procedure is:
1. create a react app
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

**Currently still no success with this**



# Conclusion
