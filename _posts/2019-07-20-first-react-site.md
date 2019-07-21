---
layout: post
title: Trying out ReactJS... And why you should use it too
subtitle: 'Weekend Project #1 - Making a Tic Tac Toe Game using ReactJS'
comments: true
show-avatar: false
tags: [web-development, React, ReactJS, JavaScript, HTML, CSS]
---


I've always been hearing about React and I thought that this weekend spend sometime exploring ReactJS, a very popular and powerful web framework.

_My **real goal** was to see if it would be a good idea to build my portfolio site using ReactJS and to see how I could potentially do that._

### Advantages and Disadvantages of ReactJS

There are many Pros and Cons of using ReactJS, but here are some:

**Advantages of React**

- Uses Virtual DOM: React creates its own virtual DOM allowing for increased performance and efficiency of website performance. This also made it possible for developers to improve programming times because it enabled hot realoading (reloading in real-time).

- Component Based: An application can be divided into many component making the code easy to maintain and scale.

- MVC Concept: React separates its projects into a Model, View and Controller making development faster and more modular development.

- Uses JSX: Allows us to write JavaScript code with HTML Syntax. Having the JavaScript code and HTML code in one file aids with code readability.

**Disadvantages of React**

- Can be a steep learning curve: For those who are new to web development or even new to Object Orientated programming might find React a little confusing at first. I have Object Orientated Programming knowledge so for me, following the Stater Tutorial helped me get stuck in pretty easily.

- Potential SEO Problems: Many have reported and said, that Search engines (like Google for example) can't fully index a dynamic web page where the content is generated on the client side. However, there is no full proof of this and Google has said before that their crawlers are capable of indexing and reading dynamic content.

Use Google's [Search Console](https://www.google.com/webmasters/tools/googlebot-fetch) to get a better idea of how Google sees your React app.

<br>

### Making a Tic-Tac-Toe browser game with React

Tutorial Link: [https://reactjs.org/tutorial/tutorial.html](https://reactjs.org/tutorial/tutorial.html)

I won't go through the tutorial, you can click the link above instead. Instead, I will tell you what I've learnt and maybe why you should try React too.

React uses:
- Babel, a JavaScript compiler that can translate markup or programming languages into JavaScript
- JSX (JavaScript XML): An XML/HTML-like extension to JavaScript
- Components: a React App is divided into many different components

React Allows us to create our Web elements in our JavaScript code.

```jsx
class Square extends React.Component {
  render() {
    return (
      <button
        className="square">
        Button1
      </button>
    );
  }
}
```
When Rendered, the code above will render a simple button with text "Button1"

### Conclusion... well for now.
Obviously, I still have much to learn when using React. However, following the starter Tutorial helped me realise how nice it is to have a components based (similar to OOP) design pattern. I am currently working to see if using React for creating my [portfolio site](https://johncalzado1.github.io) would be better than just using Semantic UI frontend framework.

Thanks For Reading,

John
