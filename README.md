# brightline.js

Brightline.js is a JavaScript template engine for people who demand a clean separation (a *bright line*) between presentation and logic.

#### Another JavaScript template engine? Are you f*cking serious?

You bet your ass. If you want to know why you should use Brightline (or why you shouldn't), continue reading. 

If you'd rather jump right into using Brightline, skip ahead to the [Quick Start](#quick-start) section.

## Why Brightline?

The majority of the popular JavaScript template engines (Handlebars, Mustache, jQuery, etc.) blur the line between
presentation and logic. Their templates are full of noise: control structures, loops, helpers, arguments, and all
sorts of other constructs that move the logic of how to render templates into the templates themselves.

*I hate this.*

---

**First of all,** they force the developer to essentially learn a whole new markup language in order to write and/or understand the templates. Sure, some of it is simple and self-explanatory. Most people won't be tripped up by an `{{#if}}` or an `{{#else}}` or even an `{{#each}}`.

But what about a `{{#list nav id="nav-bar" class="top"}}` tag?

Hmm. Not so sure about that one. Is that a feature of the templating engine? A custom helper? What does the pound symbol mean? Why are there two key=value pairs, but `nav` is all by itself? Is it lonely? Do the other pairs make fun of it because it doesn't have any friends? They probably do. Jerks.

Let's check the template engine's docs for `list` or `nav`. Nope not there. 

Okay, so it must be a custom helper of some kind. Wonder what it does ...?

If I had to guess, I'd say it creates a `<nav>` element with an id of `list`, since that pound symbol means `id` in css and jQuery. 

But, uh, there's also an `id="nav-bar"`, so maybe *that's* the id ...? 

Damnit, better find the helper code to be sure.

So I comb through the JavaScript for a while, and finally I find this:

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

Holy hell. What a nightmare. 

HTML tags in the JavaScript? What is this, the 90's? 

And what's `context`? What's `options`? What's `options.hash`? Or `options.fn`? 

Back to the template engine docs again ...

---

**Second**, the markup for these template engines often tightly couples the template to the structure of the object used to populate the template. This limits the reusability of your templates. 

For example, if your template for an unordered list has `{{#each dogs}}`, you must pass it an object with a `dogs` property. Want to display `cats` using the same template? Sorry. You'll have to duplicate all your markup, and wrap it in `{{#each cats}}`.

Tightly coupling the template to the object structure also makes the templates more brittle. If the object changes -- say, `dogs` changes to `pets` -- then your templates will break.

---

**Third**, most of the major template engines do some sort of eval'ing under the hood. Either they use `eval()` directly, or via `new Function()`. Not only is this a security risk, but it means that the template engines are completely unusable in contexts where the Content-Security-Policy disallows eval.

I found this out the hard way when I implemented Handlebars in [StayFocusd](https://chrome.google.com/webstore/detail/laankejkbhbdhmipfmgcngdelahlfoji), my Google Chrome extension. Chrome recently made [their Content-Security-Policy](https://developer.chrome.com/extensions/contentSecurityPolicy.html) extremely strict, disallowing `eval()` in every possible way. Unfortunately, this also made every templating library I could find completely unusable. 

So I wrote my own.

## Features

### Clean, simple syntax

Brightline templates only have two concepts: *variables* and *blocks*. No plugins. No expressions. No helpers. No conditionals. No loops. No functions.

### No magic

All the logic for rendering Brightline templates is in *your* JavaScript. If you need a loop, you write a loop. Need an `if/else` statement? Write one. Want to run values through a function before inserting them in the template? Write the function, pass the return value to Brightline. 

By keeping *all* template logic in your JavaScript, there are no surprises. You can see exactly what's happening, allowing you to organize your code in much more readable, maintainable fashion.

### No eval()

Because the template logic is in your JavaScript code, there's no need for Brightline to use `eval()` or `new Function()` to render templates. That means you can use Brightline even under strict Content-Security-Policy settings.

## Quick start

This is the simplest possible use of Brightline:

```javascript
new Brightline('<div>{{name}}</div>').set({ name : 'Brad Pitt' }).render();
```
###### Result:

```html
<div>Brad Pitt</div>
```



Got it? Good. Let's break down what's happening:

Calling `new Brightline()` creates a new instance of the Brightline template engine. We pass a *template string* to the constructor, in this case `<div>{{name}}</div>`. This template string contains a single *variable*, `{{name}}`.

Under the hood, Brightline parses this template string, extracting any variables that it finds.

The Brightline constructor returns an instance of the Brightline API, which makes all of the Brightline methods *chainable*. Using this chaining, we next call the `set()` method, passing to it an object containing a key:value pair: `{ name : 'Brad Pitt' }`.

Brightline takes the object passed to `set()`, and checks to see whether it contains any variables that were extracted from the template. In this case, it finds `name` and sets the value of the template variable to `Brad Pitt`.

The `set()` method is also chainable, so next we chain it with the `render()` method. This tells Brightline to replace all the variables in the template string with the values passed to it via `set()`. It then returns the rendered template, and *voila* ... `<div>Brad Pitt</div>`.

#### A note on method chaining

In a simple example like this, method chaining is a nice device. However, in more complex examples, chaining could be more confusing than helpful. For clarity, we could easily write the same code above like this:

```javascript
var templateString  = '<div>{{name}}</div>';
var content         = { name : 'Brad Pitt' };
var template        = new Brightline(templateString);

template.set(content);

var html            = template.render();

console.log(html); //outputs: <div>Brad Pitt</div>
```

## Template syntax

Brightline templates are incredibly, delightfully simple. There are only two main concepts: *variables* and *blocks*. That's it.

### Variables

Variables are expressed using familiar Mustache-style formatting, like `{{variableName}}`:

```html
<p>{{name}} is a great actor.</p>
```

Variables can also use dot-notation to reference values in a nested object:

```html
<p>{{name.first}} {{name.last}} is a great actor.</p>
```

Variables are replaced with values using the `set()` method, as described in the [API](#setkeyvalue-or-setcontentobj) docs below.

### Blocks

Blocks are expressed using HTML comments that surround the block:

```html
<ul>
    <!-- BEGIN item -->
    <li>{{name}}</li>
    <!-- END item -->
</ul>
```

Blocks can also be nested:

```html
<ul>
    <!-- BEGIN item -->
    <li>
        <!-- BEGIN photo -->
        <img src="{{photoURL}}" />
        <!-- END photo -->
        {{name}}     
    </li>
    <!-- END item -->
</ul>
```

## Loading templates

### Inline

The easiest way to load a template is to include it in your html page, wrapped in special `x-brightline-template` script tags. Using `script` tags ensures that the template markup isn't visible in the page.

```html
<html>
<head>
<title>Example</title>
<script language="JavaScript" type="text/javascript" src="src/Brightline.js"></script>
</head>
<body></body>

<script id="myTemplate" type="text/x-brightline-template">
    <div>
        <h1>This is my template</h1>
        <h2>Current mood: {{mood}}</h2>
    </div>
</script>

</html>
```

You can then pull the template into a JavaScript variable with a simple `getElementById()`:

```javascript
var templateString = document.getElementById('myTemplate').innerHTML;
```

Use the `templateString` to create a new Brightline template, and you're off to the races:

```javascript
var template = new Brightline(templateString);

template.set('mood','happy');

// Replace contents of body tag with rendered template
document.getElementsByTagName('body')[0].innerHTML = template.render();

// Once you're done with the template, you can optionally wipe it out, to reduce the amount of markup on the page
document.getElementById('myTemplate').innerHTML = '';
```

### AJAX

Another way to load templates is to fetch them as html files off a server, via AJAX. Explaining how to do that is outside the scope of these docs -- if you don't know how to do it, the [jQuery AJAX docs](http://api.jquery.com/category/ajax/) are a good start.

### HTML5 

If you're building a browser extension or some other app that is designed to run on the local file system, you may be able to use the HTML5 File API to load your templates from disk. [HTML5 Rocks](http://www.html5rocks.com/en/tutorials/file/dndfiles/) has a good tutorial to get you started.

## API

All of Brightline's power is derived from a handful of simple methods:

 * [Brightline(*templateString*,*options*)](#brightlinetemplatestring-options)
 * [set(*key*,*value*) OR set(*contentObj*)](#setkeyvalue-or-setcontentobj)
 * [setScope(blockName)](#setscopeblockname)
 * [clearScope()](#clearscope)
 * [parse(*blockName*)](#parseblockname)
 * [touch(*blockName*)](#touchblockname)
 * [render(*blockName*)](#renderblockname)
 * [snip(*blockName*)](#snipblockname)
 
*NOTE:* All the examples in the API docs display templates as HTML blocks and JavaScript as code blocks. The presumption is that the html template will be fetched into a variable named `templateString` by whatever means you choose. So, when you see something like `new Brightline(templateString)`, assume that `templateString` contains the contents of the template in the example.
      
---

### Brightline(*templateString*, *options*)
* [REQUIRED] *templateString:* HTML string containing variables and/or blocks
* [OPTIONAL] *options:* Optional object containing configuration options

The Brightline constructor must be passed a template string containing variables and/or blocks.

```html
<div>{{name}}</div>
```

```javascript
var template = new Brightline(templateString);
```

You can optionally pass an object containing configuration options:
* *name*: Plain-English name of the template. This is used in debug logging, to distinguish between log messages coming from multiple Brightline instances. 
* *logLevel*: String containing the level of logging to output to the console (OFF, ERROR, WARN, INFO, DEBUG)

```html
<div>{{name}}</div>
```

```javascript
var options = {
    name : 'Example Template',
    logLevel : 'DEBUG'
};

var template = new Brightline(templateString,options);
```

---

### set(*key*,*value*) or set(*contentObj*)
* [REQUIRED] *key:* Variable name
* [REQUIRED] *value:* Variable value
                    
**OR**

* [REQUIRED] *contentObj:* Object containing key:value pairs representing variable names and the values with which to replace them.

The `set()` method is used to set the value of a variable in a template. It can be used to set each value individually, like `set(key,value)`, or it can set many values at once by passing a content object, like `set(contentObj)`.

Calling `set()` once will replace *all* instances of the variable in the template. If you want to limit the replacement of a variable to a certain block, you'll need to use `set()` in conjunction with `setScope()`. 

##### set(*key*,*value*)

```html
{{man}} is married to {{woman}}. {{man}} loves {{woman}} very much.
```

```javascript
var template = new Brightline(templateString);

template.set('man','Brad');
template.set('woman','Angelina');
```

###### Result:

```html
Brad is married to Angelina. Brad loves Angelina very much.
```

##### set(*contentObj*)

```html
{{man}} is married to {{woman}}. {{man}} loves {{woman}} very much.
```

```javascript
var template = new Brightline(templateString);

template.set({
    man     : 'Brad',
    woman   : 'Angelina'
});
```

###### Result:

```html
Brad is married to Angelina. Brad loves Angelina very much.
```

---

### setScope(*blockName*)
* [REQUIRED] *blockName:* The name of the block to which the scope will be set

The `setScope()` method is used to limit the scope of variable replacements to a specific block. 

This is useful when you want to use the same variable name in multiple blocks while only parsing it in certain blocks:

```html
<!-- BEGIN block1 -->
<p>{{name}} is a great actor</p>
<!-- END block1 -->

<!-- BEGIN block2 -->
<p>{{name}} is a great football player</p>
<!-- END block2 -->
```

```javascript
var template = new Brightline(templateString);
template.setScope('block1');
template.set('name','Brad Pitt'); // This will only set {{name}} in block1
```
###### Result:

```html
<p>Brad Pitt is a great actor</p>
```

This is also useful when you want to set different values for the same variable in different blocks:

```html
<!-- BEGIN block1 -->
<p>{{name}} is a great actor</p>
<!-- END block1 -->

<!-- BEGIN block2 -->
<p>{{name}} is a great football player</p>
<!-- END block2 -->
```

```javascript
var template = new Brightline(templateString);
template.setScope('block1');
template.set('name','Brad Pitt'); // This will set {{name}} in block1
template.setScope('block2');
template.set('name','Eli Manning'); // This will set {{name}} in block2
```
###### Result:

```html
<p>Brad Pitt is a great actor</p>
<p>Eli Manning is a great football player</p>
```

---

### clearScope()

The `clearScope()` method clears a previously set scope, restoring the global scope.

This is useful when you've already called setScope(), and you now want to replace variables in all blocks:

```html
<!-- BEGIN block1 -->
<p>{{name}} is a {{adjective}} actor</p>
<!-- END block1 -->

<!-- BEGIN block2 -->
<p>{{name}} is a {{adjective}} football player</p>
<!-- END block2 -->
```

```javascript
var template = new Brightline(templateString);
template.setScope('block1');
template.set('name','Brad Pitt'); // This will set {{name}} in block1
template.setScope('block2');
template.set('name','Eli Manning'); // This will set {{name}} in block2
template.clearScope();
template.set('adjective','great'); // This will set {{adjective}} in both blocks
```
###### Result:

```html
<p>Brad Pitt is a great actor</p>
<p>Eli Manning is a great football player</p>
```
---

### parse(*blockName*)
* [REQUIRED] *blockName:* The name of the block to parse

The `parse()` method adds a block to the rendered template. By default, `parse()` is called internally whenever a variable is set. In other words, setting a variable will result in any blocks containing the variable to be automatically added to the rendered template.

However, sometimes you'll want to add a block to the rendered template multiple times, such as when looping through an array or object:

```html
<ul>
    <!-- BEGIN item -->
    <li>{{name}}</li>
    <!-- END item -->
</ul>
```

```javascript
var actors = ['Brad Pitt','George Clooney','Matt Damon'];
var template = new Brightline(templateString);

for (var i=0;i<actors.length;i++){
    
    template.set('name',actors[i]);
    template.parse('item'); // each time this is called, the item block is added to the rendered template
}
```
###### Result:

```html
<ul>
    <li>Brad Pitt</li>
    <li>George Clooney</li>
    <li>Matt Damon</li>
</ul>
```
---

### touch(*blockName*)
* [REQUIRED] *blockName:* The name of the block to touch

The `touch()` method adds a block to the rendered template, even when it doesn't have any variables in it. 

```html
<!-- BEGIN error -->
Something bad happened!
<!-- END error -->

<!-- BEGIN success -->
It worked!
<!-- END success -->
```

```javascript
var template = new Brightline(templateString);
template.touch('error');
```
###### Result:

```html
Something bad happened!
```

The `touch()` method works similar to `parse()`, in that it can be called multiple times to add the block more than onceto the rendered template:

```html
I am <!-- BEGIN howMuch -->very, <!-- END howMuch --> happy to see you!
```

```javascript
var template = new Brightline(templateString);

for (var i=0;i<4;i++){
    template.touch('howMuch');
}
```
###### Result:

```html
I am very, very, very, very, happy to see you!
```
---

### render(*blockName*)
* [OPTIONAL] *blockName:* The name of the block to render. If no block is specified, the entire template is rendered.

The `render()` method returns a template string in which all variables have been replaced and blocks have been parsed and/or touched.

The most common use of the `render()` method is to call it with no arguments, so it returns the full rendered template:

```html
{{man}} is married to {{woman}}. {{man}} loves {{woman}} very much.
```

```javascript
var template = new Brightline(templateString);

template.set('man','Brad');
template.set('woman','Angelina');

var html = template.render();
```
###### Result:

```html
Brad is married to Angelina. Brad loves Angelina very much.
```

The `render()` method can also be used to render individual blocks from a template:

```html
<!-- BEGIN continue -->;
<img src="continueButton.png" alt="{{altText}}" />
<!-- END continue -->

<!-- BEGIN buy -->
<img src="buyButton.png" alt="{{altText}}" />
<!-- END buy -->
```

```javascript
// Imagine you have all your buttons in one template file, so they can be re-used in many pages
var template = new Brightline(templateString);

template.setScope('continue');
template.set('altText','Continue');

var continueButton = template.render('continue');

template.setScope('buy');
template.set('altText','Buy Now');

var buyButton = template.render('buy');
```

```html
{{buyButton}} {{continueButton}}
```

```javascript
// Now imagine you have a shopping cart page that uses some buttons
var template2 = new Brightline(templateString2);
template2.set('buyButton',buyButton);
template2.set('continueButton',continueButton);

var html = template2.render();
```
###### Result:

```html
<img src="buyButton.png" alt="Buy Now" /> <img src="continueButton.png" alt="Continue" />
```

**IMPORTANT:** `render()` should be used to render the entire template OR to render individual blocks. You should never call `render()` using a block name, then call it again with no block name. If do you, you will get unexpected results.

---

### snip(*blockName*)
* [REQUIRED] *blockName:* The name of the block to snip

The `snip()` method gets the rendered content of a block, without actually touching it (so it won't appear in the rendered template itself). This is useful when there's content in a template that you want to pull into a variable.

```html
<!-- BEGIN error -->
Something bad happened!
<!-- END error -->

<!-- BEGIN success -->
It worked!
<!-- END success -->

<!-- BEGIN logMessage -->
Error code: {{errorCode}}
<!-- END logMessage -->
```

```javascript
var template = new Brightline(templateString);

template.touch('error');
template.set('errorCode','100.1234');

var logMessage = template.snip('logMessage');

console.error(logMessage); // The console will display: Error code: 100.1234
```
###### Result:

```html
Something bad happened!
```

## Understanding rendering

In some cases, it may be helpful to understand how Brightline renders templates. If your template isn't rendering like you expect, some of the topics below may help you understand why.

* [Unused variables are replaced with empty strings when the template is rendered.](#unused-variables-are-replaced-with-empty-strings-when-the-template-is-rendered)
* [If a variable in a block is set, the block is automatically parsed.](#if-a-variable-in-a-block-is-set-the-block-is-automatically-parsed)
* [If a block doesn't have any variables set, it will not be parsed unless it is touched with touch()](#if-a-block-doesnt-have-any-variables-set-it-will-not-be-parsed-unless-it-is-touched-with-touch)
* [If a variable is set in a child block, or a child block is touched, then the parent block is automatically parsed.](#if-a-variable-is-set-in-a-child-block-or-a-child-block-is-touched-then-the-parent-block-is-automatically-parsed)
* [When rendering a template, Brightline respects the order of your source template's markup.](#when-rendering-a-template-brightline-respects-the-order-of-your-source-templates-markup)
* [Each block maintains its own render stack.](#each-block-maintains-its-own-render-stack)

---

#### Unused variables are replaced with empty strings when the template is rendered.

Notice in the example below that `{{adjective}}` is not set, and is therefore not in the rendered template.

```html
{{name}} is a {{adjective}} quarterback.
```

```javascript
var template = new Brightline(templateString);
template.set('name','Eli Manning');
template.render();
```
###### Result:

```html
Eli Manning is a quarterback 
```
---
#### If a variable in a block is set, the block is automatically parsed.

Even though `someBlock` is not explicitly parsed using `parse()`, it is still in the rendered template because `{{name}}` has been set.

```html
<!-- BEGIN someBlock -->
{{name}} is a {{adjective}} quarterback.
<!-- END someBlock -->
```

```javascript
var template = new Brightline(templateString);
template.set('name','Eli Manning');
template.render();
```
###### Result:

```html
Eli Manning is a quarterback 
```
---
#### If a block doesn't have any variables set, it will not be parsed unless it is touched with `touch()`

Notice that the `error` block does not appear in the rendered template. If we *did* want it to appear, we'd have to call `template.touch('error');`

```html
<!-- BEGIN someBlock -->
{{name}} is a {{adjective}} quarterback.
<!-- END someBlock -->

<!-- BEGIN error -->
Something bad happened!
<!-- END error -->
```

```javascript
var template = new Brightline(templateString);
template.set('name','Eli Manning');
template.render();
```
###### Result:

```html
Eli Manning is a quarterback 
```
---
#### If a variable is set in a child block, or a child block is touched, then the parent block is automatically parsed.

Consider the following example:

```html
<!-- BEGIN someBlock -->

{{name}} is a {{adjective}} quarterback.

    <!-- BEGIN photo -->
    <img src="{{photoURL}}" />
    <!-- END photo -->
    
<!-- END someBlock -->
```

```javascript
var template = new Brightline(templateString);
template.set('photoURL','eli.jpg');
template.render();
```

###### Result:

```html
is a quarterback
<img src="eli.jpg" />
```

Uh oh. That's not right. What happened?

The `photoURL` variable is in the `photo` block, which is a child of the `someBlock` block. When `photoURL` is set, the child block is automatically parsed ... which automatically parses the parent block as well.

We haven't set any values for `name` or `adjective`, so those variables are replaced with empty strings. However, the rest of the test from that sentence is still rendered.

The solution is simple: Wrap the rest of the content of `someBlock` in its own block:

```html
<!-- BEGIN someBlock -->

    <!-- BEGIN description -->
    {{name}} is a {{adjective}} quarterback.
    <!-- END description -->

    <!-- BEGIN photo -->
    <img src="{{photoURL}}" />
    <!-- END photo -->
    
<!-- END someBlock -->
```

When this template is rendered, the `description` block is left unparsed, since none of its variables have been set. Therefore, the result is what you'd expect:

###### Result:

```html
<img src="eli.jpg" />
```

---
#### When rendering a template, Brightline respects the order of your source template's markup.

In other words, the order in which you call Brightline methods does not affect the order in which the elements appear in the rendered template.

Notice in the example below that, even though the `second` block is touched before the `first` block, the `first` block still appears before the `second` block in the rendered template.

```html
<!-- BEGIN first -->
This is first. 
<!-- END first -->

<!-- BEGIN second -->
This is second. 
<!-- END second -->
```

```javascript
var template = new Brightline(templateString);
template.touch('second');
template.touch('first');
template.render();
```
###### Result:

```html
This is first. This is second.
```

---

#### Each block maintains its own render stack.

Each time you touch or parse a block, it is added to the block's render stack. When the template is rendered, the block is replaced with everything from its render stack.

If you're not careful, you can end up with unexpected results. 

For example, suppose you want to loop through some actors and output each with a photo and a name. You might try something like this:

```html
<!-- BEGIN photo -->
<img src="{{photoURL}}" />
<!-- END photo -->

<!-- BEGIN name -->
{{name}}
<!-- END name -->
```

```javascript
var template = new Brightline(templateString);

var actors = [
    
    {
        name : 'Brad Pitt',
        photoURL : 'brad.jpg'
    },
    {
        name : 'George Clooney',
        photoURL : 'george.jpg'
    },
    {
        name : 'Matt Damon',
        photoURL : 'matt.jpg'
    }
];

for (var i=0;i<actors.length;i++){
    
    template.set('photoURL',actors[i].photoURL);
    template.parse('photo');
    
    template.set('name',actors[i].name);
    template.parse('name');
}

template.render();
```

**THIS IS WRONG**. 

Following the example above will give you:

###### Result:

```html
<img src="brad.jpg" />
<img src="george.jpg" />
<img src="matt.jpg" />
Brad Pitt
George Clooney
Matt Damon
```

Why? 

When Brightline parses your template, it converts each block into a placeholder:

```html
{{__photo__}}

{{__name__}}
```

It then creates a TemplateBlock object for each block, which maintains the rendered content for that block. When you call `parse()` or `touch()`, the parsed/touched block is pushed onto the rendered content stack for that block.

This is a simplified example, but it basically happens like this:

```javascript
var photo = ['<img src="brad.jpg" />','<img src="george.jpg" />','<img src="matt.jpg" />'];
var name = ['Brad Pitt','George Clooney','Matt Damon'];
```

Then, when then whole template is rendered, the block placeholder is replaced with the stack of rendered content for that block.

`{{__photo__}}` is replaced with `['<img src="brad.jpg" />','<img src="george.jpg" />','<img src="matt.jpg" />'].join()`.

`{{_name__}}` is replaced with `['Brad Pitt','George Clooney','Matt Damon'].join()`.

So the end result is:

```html
<img src="brad.jpg" />
<img src="george.jpg" />
<img src="matt.jpg" />
Brad Pitt
George Clooney
Matt Damon
```

Alright, then what's the **RIGHT** way to do it?

Simple: Just wrap the `photo` and `name` blocks in a parent block, then parse that.

```html
<!-- BEGIN actor -->

    <!-- BEGIN photo -->
    <img src="{{photoURL}}" />
    <!-- END photo -->
    
    <!-- BEGIN name -->
    {{name}}
    <!-- END name -->
    
<!-- END actor -->
```

```javascript
var template = new Brightline(templateString);

var actors = [
    
    {
        name : 'Brad Pitt',
        photoURL : 'brad.jpg'
    },
    {
        name : 'George Clooney',
        photoURL : 'george.jpg'
    },
    {
        name : 'Matt Damon',
        photoURL : 'matt.jpg'
    }
];

for (var i=0;i<actors.length;i++){
    
    template.set('photoURL',actors[i].photoURL);
    template.parse('photo');
    
    template.set('name',actors[i].name);
    template.parse('name');
    
    template.parse('actor'); // This is the key to making it work the way you want
}

template.render();
```

Now you'll get what you wanted:

###### Result:

```html
<img src="brad.jpg" /> Brad Pitt
<img src="george.jpg" /> George Clooney
<img src="matt.jpg" /> Matt Damon
```

## Questions? Bugs? Suggestions?

Please submit all bugs, questions, and suggestions via the [Issues](https://github.com/wmbenedetto/brightline.js/issues) section so everyone can benefit from the answer.

If you need to contact me directly, email warren@transfusionmedia.com.

## MIT License

Copyright (c) 2012 Warren Benedetto <warren@transfusionmedia.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.