# brightline.js

Brightline.js is a JavaScript Template Engine for people who demand a clean separation (a *bright line*) between presentation and logic.

## Why use Brightline.js?

The majority of the popular JavaScript template engines (Handlebars, Mustache, jQuery, etc.) blur the line between
presentation and logic. Their templates are full of noise: control structures, loops, helpers, arguments, and all
sorts of other constructs that move the logic of how to render templates into the templates themselves.

**I hate this.**

First of all, it forces the developer to essentially learn a whole new markup language in order to write and/or understand the templates.
Sure, some of it is simple and self-explanatory. Most people won't be tripped up by an `{{#if}}` or an `{{#else}}` or even an `{{#each}}`.

But what about a `{{#list nav id="nav-bar" class="top"}}` tag?

Hmm. Not so sure about that one. Is that a feature of the templating engine? A custom helper? What does the pound symbol mean?
Why are there two key=value pairs, but `nav` is all by itself? Is it lonely? Do the other pairs make fun of it because it doesn't
have any friends? They probably do. Jerks.

Let's check the template engine's docs for `list` or `nav`. Nope not there. Okay, so it must be a helper. Wonder what it does ...?

If I had to guess, I'd say it creates a `<nav>` element with an id of `list`, since that pound symbol means `id` in css and jQuery.
But, uh, there's also an `id="nav-bar"`, so maybe *that's* the id ...? Damnit, better find the helper code to be sure.

So you comb through the JavaScript for a while, and finally you find this:

```javascript
Template.registerHelper('list', function(context, options) {
  var attrs = SC.keys(options.hash).map(function(key) {
    key + '="' + options.hash[key] + '"';
  }).join(" ");

  return "<ul " + attrs + ">" + context.map(function(item) {
    return "<li>" + options.fn(item) + "</li>";
  }).join("\n") + "</ul>";
});
```

Holy hell. What a nightmare. HTML tags in the JavaScript? What is this, the 90's? And what's `context`? What's `options`? What's `options.hash`?

Back to the template engine docs again ...



tightly couples template to object structure

# Features

## Clean, simple syntax

Brightline templates only have two concepts: *variables* and *blocks*. No plugins. No expressions. No helpers. No conditionals. No loops. No functions.

## No magic

## No eval()

# Quick start


# API

`load()`

`setName()`

`setLogLevel()`

`set()`

`parse()`

`setScope()`

`clearScope()`

`touch()`

`snip()`

`render()`


# Examples


# License


# Other projects


# Questions?