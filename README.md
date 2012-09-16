# brightline.js

Brightline.js is a JavaScript Template Engine for people who demand a clean separation (a *bright line*) between presentation and logic.

#### Another JavaScript template engine? Are you f*cking serious?

You bet your ass. If you want to know why, check out the [Why Brightline?](#why-brightline) section.

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
var html = new Brightline('<div>{{name}}</div>').set({ name : 'Brad Pitt' }).render();
console.log(html); //outputs: <div>Brad Pitt</div>
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

## Templates

Brightline templates are incredibly, delightfully simple. There are only two main concepts: *variables* and *blocks*. 

That's it.

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

## API

All of Brightline's power is derived from a handful of simple methods that can be combined in some very powerful ways.

*NOTE:* All the examples in the API docs display templates as HTML blocks and JavaScript as code blocks. The presumption is that the html template will be fetched into a variable named `templateString` by whatever means you choose. So, when you see something like `new Brightline(templateString)`, assume that `templateString` contains the contents of the template in the example.

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
* *name*: Plain-English name of the template. Same as calling `setName()`.
* *logLevel*: String containing the level of logging to output to the console. Same as calling `setLogLevel()`

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

### setName(*templateName*)
* [REQUIRED] *templateName:* Plain-English name of the template

The `setName()` method is used to set the plain-English name of the template. This is used in debug logging, to distinguish between log messages coming from multiple Brightline instances. 

```html
<div>{{name}}</div>
```

```javascript
var template = new Brightline(templateString);
template.setName('Example Template');

// console log messages are displayed like:
// [Example Template: Brightline.set()] Setting "name" to Brad Pitt 
```

---

### setLogLevel(*logLevel*)
* [REQUIRED] *logLevel:* Log level (OFF, ERROR, WARN, INFO, DEBUG)

The `setLogLevel()` method is used to throttle the amount of log messages that are output to the console. The default is ERROR. 

```html
<div>{{name}}</div>
```

```javascript
var template = new Brightline(templateString);
template.setLogLevel('DEBUG');
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

// When rendered, the template will read:
// Brad is married to Angelina. Brad loves Angelina very much.
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

// When rendered, the template will read:
// Brad is married to Angelina. Brad loves Angelina very much.
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

// When rendered, the template will read:
// <p>Brad Pitt is a great actor</p>
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

// When rendered, the template will read:
// <p>Brad Pitt is a great actor</p><p>Eli Manning is a great football player</p>
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

// When rendered, the template will read:
// <p>Brad Pitt is a great actor</p><p>Eli Manning is a great football player</p>
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

// When rendered, the template will read:
// <ul>
//     <li>Brad Pitt</li>
//     <li>George Clooney</li>
//     <li>Matt Damon</li>
// </ul>
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

// When rendered, the template will read:
// Something bad happened!
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

// When rendered, the template will read:
// I am very, very, very, very, happy to see you!
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

var html = template.render(); // Returns: Brad is married to Angelina. Brad loves Angelina very much.
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

// When template2 is rendered, html contains:
// <img src="buyButton.png" alt="Buy Now" /> <img src="continueButton.png" alt="Continue" />
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

console.error(logMessage);

// When rendered, the template will read:
// Something bad happened!

// Meanwhile, the console will display this error:
// Error code: 100.1234
```

## Best practices



## Examples

## Why Brightline?

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


## MIT License

Copyright (c) 2012 Warren Benedetto <warren@transfusionmedia.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Other projects


# Questions?