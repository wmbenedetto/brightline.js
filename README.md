# brightline.js

Brightline.js is a JavaScript Template Engine for people who demand a clean separation (a *bright line*) between presentation and logic.

## Another JavaScript template engine? Seriously? Are you f*cking insane?

Yes. Seriously. And here's why:

The majority of the popular JavaScript template engines (Handlebars, Mustache, jQuery, etc.) blur the line between
presentation and logic. Their templates are full of noise: control structures, loops, helpers, arguments, and all
sorts of other constructs that move the logic of how to render templates into the templates themselves.

*I hate this.*

---

**First of all,** it forces the developer to essentially learn a whole new markup language in order to write and/or understand the templates.
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

Holy hell. What a nightmare. HTML tags in the JavaScript? What is this, the 90's? 

And what's `context`? What's `options`? What's `options.hash`? Or `options.fn`? Back to the template engine docs again ...

---

**Second**, the markup for these template engines often tightly couples the template to the structure of the object used to populate the template. This limits the reusability of your templates. 

For example, if your template for an unordered list has `{{#each dogs}}`, you must pass it an object with a `dogs` property. Want to display `cats` using the same template? Sorry. You'll have to duplicate all your markup, and wrap it in `{{#each cats}}`.

Tightly coupling the template to the object structure also makes the templates more brittle. If the object changes -- say, `dogs` changes to `pets` -- then your templates will break.

---

**Third**, most of the major template engines do some sort of eval'ing under the hood. Either they use `eval()` directly, or via `new Function()`. Not only is this a security risk, but it means that the template engines are completely unusable in contexts where the Content-Security-Policy disallows eval, such as in Google Chrome extensions.


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