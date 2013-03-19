/** @license Brightline.js | MIT License | https://github.com/wmbenedetto/brightline.js#mit-license */
if (typeof MINIFIED === 'undefined'){
    MINIFIED = false;
}

/**
 *     ____  ____  ____________  __________    _____   ________     _______
 *    / __ )/ __ \/  _/ ____/ / / /_  __/ /   /  _/ | / / ____/    / / ___/
 *   / __  / /_/ // // / __/ /_/ / / / / /    / //  |/ / __/  __  / /\__ \
 *  / /_/ / _, _// // /_/ / __  / / / / /____/ // /|  / /____/ /_/ /___/ /
 * /_____/_/ |_/___/\____/_/ /_/ /_/ /_____/___/_/ |_/_____(_)____//____/
 *
 * Brightline.js : The JavaScript Template Engine
 *
 * Copyright (c) 2012 Warren Benedetto <warren@transfusionmedia.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(window,undefined) {

    if (!MINIFIED){

        var logLevels = {
            OFF                                     : 0,
            ERROR                                   : 1,
            WARN                                    : 2,
            INFO                                    : 3,
            DEBUG                                   : 4
        };

        var logLevel                                = 'OFF';
        var console                                 = window.console || {};

        console.log                                 = (typeof console.log   === 'function') ? console.log   : function() {};
        console.info                                = (typeof console.info  === 'function') ? console.info  : console.log;
        console.error                               = (typeof console.error === 'function') ? console.error : console.log;
        console.warn                                = (typeof console.warn  === 'function') ? console.warn  : console.log;

        /**
         * Default log() implementation
         *
         * This can be overridden by defining a log() function in the initObj
         * passed to the constructor
         *
         * @param funcName The name of the function generating the log message
         * @param message The message to log
         * @param payload Data object
         * @param level Log level (ERROR, WARN, INFO, DEBUG)
         */
        var log = function(funcName,message,payload,level) {

            payload                                 = (!payload) ? '' : payload;
            level                                   = (!level) ? 'INFO' : level.toUpperCase();
            message                                 = '[' + funcName + '()] ' + message;

            if (isLoggable(level)) {

                if (level === 'ERROR') {
                    console.error(message,payload);
                } else if (level === 'WARN') {
                    console.warn(message,payload);
                } else if (level === 'INFO') {
                    console.info(message,payload);
                } else {
                    console.log(message,payload);
                }
            }
        };

        /**
         * Checks whether the given level is loggable based on the
         * current log level
         *
         * @param level The level to check
         * @return {Boolean}
         */
        var isLoggable = function(level){

            var currentLogLevel                     = logLevels[logLevel];
            var thisLogLevel                        = logLevels[level];

            return thisLogLevel <= currentLogLevel;
        };
    }

    /**
     * Determines whether a variable is empty
     *
     * @param item The variable to check
     */
    var isEmpty = function(item){

        if (typeof item == 'object' && item !== null){

            for (var prop in item) {

                if (item.hasOwnProperty(prop)){
                    return false;
                }
            }

            return true;
        }

        return typeof item === 'undefined' || item === null || item === '';
    };

    /**
     * Checks whether an item is already in the source array
     *
     * @param item The item to check
     * @param source The source array in which to look
     * @return {Boolean}
     */
    var inArray = function(item,source) {

        for (var i=0;i<source.length;i++) {

            if (item === source[i]) {
                return true;
            }
        }

        return false;
    };

    /**
     * Checks whether obj is an array
     *
     * @param obj The object to check
     */
    var isArray = function(obj){
        return typeof obj === 'object' && obj !== null && typeof obj.length === 'number';
    };

    /**
     * Checks whether an object is an object literal (non-null, non-array)
     *
     * @param obj The object to check
     * @return {Boolean}
     */
    var isObjLiteral = function(obj) {
        return typeof obj === 'object' && obj !== null && typeof obj.length !== 'number';
    };

    /**
     * Flattens nested object into single dimensional object with dot-notated paths
     *
     * @param source The source object
     * @param pathArray Array representing nested paths
     * @param result The result object
     * @return {Object}
     */
    var flattenObj = function(source,pathArray,result){

        pathArray                               = (typeof pathArray === 'undefined') ? [] : pathArray;
        result                                  = (typeof result === 'undefined') ? {} : result;

        var key, value, newKey;

        for (var i in source){

            if (source.hasOwnProperty(i)){

                key                             = i;
                value                           = source[i];

                pathArray.push(key);

                if (typeof value === 'object' && value !== null){

                    result                      = flattenObj(value,pathArray,result);

                } else {

                    newKey                      = pathArray.join('.');
                    result[newKey]              = value;
                }

                pathArray.pop();
            }
        }

        return result;
    };

    /**
     * Trims leading and/or trailing whitespace from string
     *
     * @param str The string to trim
     */
    var trim = function(str){
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };

    /**
     * Add bind() to Function prototype for browsers that don't yet support ECMAScript 5.
     *
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     */
    Function.prototype.bind = function(scope) {

        var self                                = this;

        return function() {
            return self.apply(scope,arguments);
        }
    };

    /**
     * TemplateBlock class constructor
     *
     * @param name The name of the template block
     * @constructor
     */
    var TemplateBlock = function TemplateBlock(name){

        this.name                                = name;
        this.content                             = '';
        this.touched                             = 0;
        this.variables                           = [];
        this.parsedContent                       = [];
        this.variableCache                       = {};
        this.usedVariables                       = {};
    };

    /**
     * TemplateBlock class prototype
     *
     * @type {Object}
     */
    TemplateBlock.prototype = {

        NODE_ID                                 : null,

        name                                    : null,
        content                                 : null,
        touched                                 : null,
        variables                               : null,
        parsedContent                           : null,
        variableCache                           : null,
        usedVariables                           : null,

        reset : function(){
            this.parsedContent                  = [];
            this.usedVariables                  = {};
            this.touched                        = 0;
        },

        isAlreadyParsed : function(varName){
            return varName in this.usedVariables;
        },

        getName : function(){
            return this.name;
        },

        getParsedContent : function(){
            return this.parsedContent;
        },

        addParsedContent : function(content){
            this.parsedContent.push(content);
        },

        setParsedContent : function(content){
            this.parsedContent                  = content;
        },

        getContent : function(){
            return this.content;
        },

        setContent : function(content){
            this.content                        = content;
        },

        setVariables : function(variables){
            this.variables                      = variables;
        },

        getVariables : function(){
            return this.variables;
        },

        setTouched : function(num){
            this.touched                        = num;
        },

        touch : function(){
            this.touched                       += 1;
        },

        getTouched : function(){
            return this.touched;
        },

        getVariableCache : function(){
            return this.variableCache;
        },

        setUsedVariable : function(key,value){
            this.usedVariables[key]             = value;
        },

        /**
         * Alias for getName()
         */
        getNodeID : function(){
            return this.getName();
        }
    };

    /**
     * Tree class constructor
     *
     * @constructor
     */
    var Tree = function Tree(){

        this.childParentMap                     = {};
        this.nodes                              = {};
        this.numNodes                           = 0;
        this.tree                               = {};
    };

    /**
     * Tree class prototype
     *
     * @type {Object}
     */
    Tree.prototype = {

        childParentMap                          : null,     // Object mapping each child's nodeID to its parent's nodeID
        nodes                                   : null,     // Object containing all nodes added to the Tree
        numNodes                                : null,     // Number of nodes added to tree
        tree                                    : null,     // Object mapping parent nodeID to array of children nodeIDs

        /**
         * Alias for global log(). Prepends "Tree." to funcName.
         *
         * @param funcName The name of the function generating the log message
         * @param message The message to log
         * @param payload Data object
         * @param level Log level (ERROR, WARN, INFO, DEBUG)
         */
        log : function(funcName,message,payload,level){

            if (!MINIFIED){
                log('Tree.'+funcName,message,payload,level);
            }
        },

        /**
         * Adds node
         *
         * @param node The node to add
         * @param id The id of the node
         */
        addNode : function(node,id){

            this.nodes[id]                      = node;
            this.numNodes                      += 1;
        },

        /**
         * Gets node
         *
         * @param id The id of the node to get
         * @return {*} Node or null if node with id doesn't exist
         */
        getNode : function(id){
            return (this.hasNode(id)) ? this.nodes[id] : null;
        },

        /**
         * Gets nodes based on array of node ids. If none are
         * specified, gets all nodes
         *
         * @param ids Array of node ids
         * @return {Object}
         */
        getNodes : function(ids){

            if (ids){

                var nodes                       = {};

                for (var i=0;i<ids.length;i++){
                    nodes[ids[i]]               = this.getNode(ids[i]);
                }

                return nodes;

            } else {

                return this.nodes;
            }
        },

        /**
         * Removes node
         *
         * @param id The id of the node to remove
         */
        removeNode : function(id){

            if (this.hasNode(id)){

                try {
                    delete this.nodes[id];
                } catch (e){
                    this.nodes[id]              = undefined;
                }

                this.numNodes                  -= 1;
            }
        },

        /**
         * Checks whether a node exists
         *
         * @param id The id of the node to check
         * @return {Boolean}
         */
        hasNode : function(id){
            return id in this.nodes;
        },

        /**
         * Checks whether the tree is empty
         *
         * @return {Boolean}
         */
        isEmpty : function(){

            for (var node in this.nodes){

                if (this.nodes.hasOwnProperty(node)){
                    return false;
                }
            }

            return true;
        },

        /**
         * Alias for hasNode()
         *
         * @param id The id of the node to check
         * @return {Boolean}
         */
        has : function(id){
            return this.hasNode(id);
        },

        /**
         * Gets the node's id
         *
         * @param node The node for which to get the id
         * @return {*}
         */
        getNodeID : function(node){

            if (typeof node === 'string' || typeof node === 'number'){
                return node;
            } else if (typeof node === 'object' && node !== null && typeof node.getNodeID === 'function'){
                return node.getNodeID();
            } else {
                throw new Error('[Tree.getNodeID()] Cannot get node ID');
            }
        },

        /**
         * Adds a child to the parent in this Tree
         *
         * @param parent The parent node
         * @param child The child node
         */
        addChild : function(parent,child){

            var parentNodeID                    = this.getNodeID(parent);
            var childNodeID                     = this.getNodeID(child);

            if (this.hasParent(child)){
                throw new Error('[Tree.addChild()] Child node '+childNodeID+' already has a parent');
            }

            if (parentNodeID === childNodeID){
                throw new Error('[Tree.addChild()] Parent and child node are the same. You cannot add a parent node as a child of itself, or vice-versa.');
            }

            if (this.hasNode(childNodeID)){
                throw new Error('[Tree.addChild()] The nodeID '+childNodeID+' is already in use');
            }

            if (!this.hasNode(parentNodeID)){
                this.addNode(parent,parentNodeID);
            }

            this.log('addChild', 'Adding child',{

                parent                          : parent,
                child                           : child

            },'DEBUG');

            this.addNode(child,childNodeID);

            if (!(parentNodeID in this.tree)){
                this.tree[parentNodeID]         = [];
            }

            this.tree[parentNodeID].push(childNodeID);

            this.childParentMap[childNodeID]    = parentNodeID;
        },

        /**
         * Adds an array of children to a parent in this Tree
         *
         * @param parent The parent node
         * @param children Array of child nodes
         */
        addChildren : function(parent,children){

            if (!isArray(children)){
                throw new Error('[Tree.addChildren()] Children added to Tree must in an array');
            }

            if (!MINIFIED){

                this.log('addChildren', 'Adding children',{

                    parent                          : parent,
                    children                        : children

                },'DEBUG');
            }

            for (var i=0;i<children.length;i++){
                this.addChild(parent,children[i]);
            }
        },

        /**
         * Gets a child based on its node ID
         *
         * @param childNodeID The child's nodeID
         * @return {*}
         */
        getChild : function(childNodeID){

            if (!this.hasNode(childNodeID)){
                throw new Error('[Tree.getChild()] Cannot get non-existent node '+childNodeID+' from Tree');
            }

            return this.getNode(childNodeID);
        },

        /**
         * Gets all the child nodes for the given parent node
         *
         * @param parent The parent node
         * @return {Object} Object containing all child nodes associated with the parent
         */
        getChildren : function(parent){

            var parentNodeID                    = this.getNodeID(parent);

            return (parentNodeID in this.tree) ? this.getNodes(this.tree[parentNodeID]) : {};
        },

        /**
         * Checks whether the parent has the given node as a child
         *
         * @param parent The parent node
         * @param child The child node
         * @return {Boolean}
         */
        hasChild : function(parent,child){

            var parentNodeID                    = this.getNodeID(parent);
            var childNodeID                     = this.getNodeID(child);

            if (!(childNodeID in this.childParentMap)){
                return false;
            }

            return (parentNodeID === this.childParentMap[childNodeID]);
        },

        /**
         * Checks whether a parent node has any children
         *
         * @param parent The parent node to check
         * @return {Boolean}
         */
        hasChildren : function(parent){

            var parentNodeID                    = this.getNodeID(parent);

            return parentNodeID in this.tree && this.tree[parentNodeID].length > 0;
        },

        /**
         * Removes a single child from a parent node
         *
         * @param parent The parent node from which to remove the child
         * @param child The child to remove
         */
        removeChild : function(parent,child){

            if (!this.isChildOf(parent,child)){
                throw new Error('[Tree.removeChild()] Cannot remove child. This node is not a child of the given parent.');
            }

            if (!MINIFIED){

                this.log('removeChild', 'Removing child',{

                    parent                          : parent,
                    child                           : child

                },'DEBUG');
            }

            var parentNodeID                    = this.getNodeID(parent);
            var childNodeID                     = this.getNodeID(child);
            var parentArray                     = this.tree[parentNodeID];

            /* Remove child from parent array */
            for (var i=0;i<parentArray.length;i++){

                if (parentArray[i] === childNodeID){
                    parentArray.splice(i,1);
                    break;
                }
            }

            /* Delete child from childParentMap */
            try {
                delete this.childParentMap[childNodeID];
            } catch (e){
                this.childParentMap[childNodeID]    = undefined;
            }

            /* If there are no children left in the parent array, remove the parent
             * array from the tree */
            if (parentArray.length === 0){

                try {
                    delete this.tree[parentNodeID];
                } catch (e){
                    this.tree[parentNodeID]     = undefined;
                }
            }

            /* Remove child from nodes collection */
            this.removeNode(childNodeID);

            /* Recursively removes any children of this child */
            if (this.hasChildren(childNodeID)){
                this.removeChildren(childNodeID);
            }
        },

        /**
         * Removes array of children from parent. If no children are specified,
         * all children are removed.
         *
         * @param parent The parent from which to remove children
         * @param children Array of children to remove (optional)
         */
        removeChildren : function(parent,children){

            if (typeof children === 'undefined' && this.hasChildren(parent)){
                children                        = this.getChildren(parent);
            }

            if (!MINIFIED){

                this.log('removeChildren', 'Removing children',{

                    parent                          : parent,
                    children                        : children

                },'DEBUG');
            }

            for (var i in children){

                if (children.hasOwnProperty(i)){
                    this.removeChild(parent,children[i]);
                }
            }
        },

        /**
         * Checks whether the child node is a child of the given parent
         *
         * @param parent The parent to inspect
         * @param child The child to check
         * @return {Boolean}
         */
        isChildOf : function(parent,child){
            return this.hasChild(parent,child);
        },

        /**
         * Adds a lone parent node
         *
         * This can only be used is cases where teh Tree has only a single node.
         * Basically, it's a trunk with no branches or leaves.
         *
         * @param parent The parent node to add
         */
        addParent : function(parent){

            if (!this.isEmpty()){
                throw new Error('[Tree.addParent()] Cannot add lone parent to a Tree that already has nodes in it. Use Tree.addChild(parent,child) instead.');
            }

            var parentNodeID                    = this.getNodeID(parent);

            if (this.hasNode(parentNodeID)){
                throw new Error('[Tree.addParent()] Parent\'s node id must be unique.');
            }

            if (!MINIFIED){
                this.log('addParent', 'Adding parent',parent,'DEBUG');
            }

            this.addNode(parent,parentNodeID);

            if (!(parentNodeID in this.tree)){
                this.tree[parentNodeID]         = [];
            }
        },

        /**
         * Gets the parent of the given node, or false if the node doesn't
         * have a parent
         *
         * @param node The node for which to get the parent
         * @return {*}
         */
        getParent : function(node){

            if (!this.hasParent(node)){
                return false;
            }

            var parentNodeID                    = this.getParentNodeID(node);

            return this.getNode(parentNodeID);
        },

        /**
         * Checks whether the given node has a parent
         *
         * @param child The node to check for a parent
         * @return {Boolean}
         */
        hasParent : function(child){

            var parentNodeID                    = this.getParentNodeID(child);

            return parentNodeID !== null;
        },

        /**
         * Gets the nodeID of the child's parent node
         *
         * @param child The child for which to get the parent's nodeID
         * @return {*}
         */
        getParentNodeID : function(child){

            var parentNodeID                    = null;

            if ((typeof child === 'string' || typeof child === 'number') && child in this.childParentMap){

                parentNodeID                    = this.childParentMap[child];

            } else if (typeof child === 'object' && child !== null && typeof child.getNodeID === 'function'){

                var childNodeID                 = child.getNodeID();
                parentNodeID                    = (childNodeID in this.childParentMap) ? this.childParentMap[childNodeID] : null;
            }

            return parentNodeID;
        },

        /**
         * Checks whether the given node is a parent
         *
         * @param node The node to check
         * @return {Boolean}
         */
        isParent : function(node){
            return this.hasChildren(node);
        },

        /**
         * Removes a node from the Tree
         *
         * NOTE: If the node being removed is a parent, its child nodes will
         * also be removed recursively.
         *
         * @param node The node to remove
         */
        remove : function(node){

            var nodeID                          = this.getNodeID(node);

            if (!MINIFIED){
                this.log('remove', 'Removing node',node,'DEBUG');
            }

            if (this.hasParent(nodeID)){

                var parent                      = this.getParent(nodeID);

                this.removeChild(parent,node);

            } else if (this.isParent(node)){

                this.removeChildren(node);
            }

            this.removeNode(nodeID);
        }
    };

    /**
     * Brightline class constructor
     *
     * @param templateString Optional html string containing template blocks and/or vars
     * @param options Optional object containing config options
     * @constructor
     */
    var Brightline = function Brightline(templateString,options) {

        this.blocks                             = new Tree();
        this.currentBlock                       = null;
        this.currentScope                       = null;
        this.usedVariables                      = {};
        this.variableCache                      = {};

        if (isObjLiteral(options)){

            logLevel                            = options.logLevel || 'ERROR';
            this.name                           = options.name || null;
        }

        if (!MINIFIED){
            this.log('constructor', 'Creating new Brightline template', options);
        }

        if (typeof templateString === 'string'){
            this.process(templateString);
        }

        return this.getAPI();
    };

    /**
     * Brightline class prototype
     *
     * @type {Object}
     */
    Brightline.prototype = {

        blocks                                  : null,
        currentBlock                            : null,
        currentScope                            : null,
        name                                    : null,
        usedVariables                           : null,
        variableCache                           : null,

        /**
         * Gets public API methods
         *
         * @return {Object}
         */
        getAPI : function(){

             return {

                 set                            : this.set.bind(this),
                 setScope                       : this.setScope.bind(this),
                 clearScope                     : this.clearScope.bind(this),
                 touch                          : this.touch.bind(this),
                 parse                          : this.parse.bind(this),
                 render                         : this.render.bind(this),
                 snip                           : this.snip.bind(this),
                 setLogLevel                    : this.setLogLevel.bind(this),
                 setName                        : this.setName.bind(this),
		 each                           : this.each.bind(this),
		 compile                        : this.compile.bind(this),
		 load                           : this.load.bind(this)
             }
        },

        setLogLevel : function(level){
            logLevel                            = level;
        },

        setName : function(name){
            this.name                           = name;
        },

        /**
         * Alias for global log(). Prepends Brightline instance name
         * to funcName.
         *
         * @param funcName The name of the function generating the log message
         * @param message The message to log
         * @param payload Data object
         * @param level Log level (ERROR, WARN, INFO, DEBUG)
         */
        log : function(funcName,message,payload,level){

            if (!MINIFIED){

                funcName                        = (this.name) ? this.name+': Brightline.'+funcName : 'Brightline.'+funcName;

                log(funcName,message,payload,level);
            }
        },

        /**
         * Sets value of variable(s)
         *
         * Can be either called like set(key,value), or can be passed an
         * object literal containing multiple key/value pairs.
         *
         * Nested object literals will replace variable placeholders in
         * templates that are named with dot notation. For example:
         *
         * set({
         *     name : {
         *         first : 'Brad',
         *         last : 'Pitt'
         *     }
         * })
         *
         * ... will replace {{name.first}} with Brad and {{name.last}} with Pitt.
         *
         * By default, calling set() will replace ALL instances of the variable in
         * the template, automatically parsing any blocks where the variable appears.
         *
         * If you need to limit the blocks in which the variable is replaced, you'll
         * need to use set() in conjunction with setScope()
         */
        set : function(){

            var args                        = Array.prototype.slice.call(arguments);
            var input                       = null;
            var value                       = null;
            var ignoreScope                 = false;

            if (isObjLiteral(args[0])){

                input                       = args[0];
                ignoreScope                 = args[1];

                this.setObjectVars(input,ignoreScope);

            } else {

                input                       = args[0];
                value                       = args[1];
                ignoreScope                 = args[2];

                if (!MINIFIED){
                    this.log('set', 'Setting "'+input+'" to ', value);
                }

                if (typeof value === 'function'){

                    value                   = value();

                } else if (typeof value === 'undefined'){

                    value                   = null;
                }

                if (this.isValidKeyValuePair(input,value)){

                    if (this.currentScope === null || ignoreScope){
                        this.variableCache[input]               = value;
                    } else {
                        this.currentScope.variableCache[input]  = value;
                    }
                }
            }

            return this;
        },

        /**
         * Iterates over an array of scalar values or object literals
         *
         * If the array contains scalar values, then you must pass the
         * array, the block name, the variable name, and an optional callback:
         *
         * template.each(someArray,blockName,varName,callbackFunc);
         *
         * If the array contains object literals, then you must pass the
         * array, the block name, and an optional callback. (The object's
         * property names will be used as variable names.)
         *
         * template.each(someArray,blockName,callbackFunc);
         *
         * Optional callback is called on each iteration. The current object
         * and iteration counter are passed to it so the callback can be used
         * to parse nested blocks.
         */
        each : function(){

            var args                        = Array.prototype.slice.call(arguments);
            var data                        = args[0];
            var blockName                   = args[1];
            var varName                     = null;
            var callback                    = null;

            if (typeof args[2] === 'string'){
                varName                     = args[2];
            } else if (typeof args[2] === 'function'){
                callback                    = args[2];
            }

            if (!callback && typeof args[3] === 'function'){
                callback                    = args[3];
            }

            for (var i in data){

                if (data.hasOwnProperty(i)){

                    if (isObjLiteral(data[i])){
                        this.set(data[i]);
                    } else if (varName) {
                        this.set(varName,data[i]);
                    }

                    if (callback){
                        callback(data[i],i);
                    }

                    this.parse(blockName);
                }
            }
        },

        /**
         * Sets the scope for variable replacement to a specific block.
         *
         * This allows you to use the same variable name in multiple
         * blocks in a template, while limiting the replacement
         * of that variable to a single block.
         *
         * For example, this template ...
         *
         * <!-- BEGIN hi -->
         * Hi, {{firstName}} {{lastName}}
         * <!-- END hi -->
         *
         * <!-- BEGIN welcome -->
         * Welcome, {{firstName}} {{lastName}}
         * <!-- END welcome -->
         *
         * ... could be parsed like ...
         *
         * template.set('lastName','Pitt');
         *
         * template.setScope('hi');
         * template.set('firstName','Brad');
         *
         * template.setScope('welcome');
         * template.set('firstName','Mr.');
         *
         * return template.render();
         *
         * ... which would return ...
         *
         * Hi, Brad Pitt
         * Welcome, Mr. Pitt
         *
         * Notice that lastName is only set once. Because it is set without
         * any scope defined, it is replaced with the same value in both blocks.
         *
         * @param blockName
         */
        setScope : function(blockName){

            if (!this.hasBlock(blockName)){
                throw new Error('['+this.name+' Brightline.setScope()] Cannot set scope to non-existent block: '+blockName);
            }

            if (!MINIFIED){
                this.log('setScope', 'Setting scope to '+blockName);
            }

            this.currentScope               = this.getBlock(blockName);

            return this;
        },

        /**
         * Clears scope that was previously set via setScope()
         *
         * The use-case for clearScope() is when you want to set variables
         * in the global scope after having already called setScope() to limit
         * scope to a specific block.
         *
         * @param resetScope
         */
        clearScope : function(resetScope){

            if (!MINIFIED){
                this.log('clearScope', 'Clearing scope');
            }

            resetScope                      = (typeof resetScope === 'undefined') ? true : resetScope;

            if (!resetScope && this.currentScope !== null){

                this.currentScope.variableCache     = {};
                this.currentScope.usedVariables     = {};
            }

            if (resetScope){
                this.currentScope           = null;
            }

            return this;
        },

        /**
         * Flags a block to be added to the rendered template, even if it doesn't
         * have any variables or hasn't had any variables set.
         *
         * Any unset variables in touched blocks will be replaced with empty strings.
         *
         * Touching a block multiple times will add it to the rendered template
         * multiple times.
         *
         * For example, this template ...
         *
         * <!-- BEGIN duck -->
         * <img src="duck.png" />
         * <!-- END duck -->
         * <!-- BEGIN goose -->
         * {{gooseName}} <img src="goose.png" />
         * <!-- END goose -->
         *
         * ... could be parsed like ...
         *
         * template.touch('duck');
         * template.touch('duck');
         * template.touch('goose');
         * return template.render();
         *
         * ... which would render ...
         *
         * <img src="duck.png" />
         * <img src="duck.png" />
         * <img src="goose.png" />
         *
         * @param blockName The name of the block to touch
         */
        touch : function(blockName){

            var templateBlock               = this.getBlock(blockName);

            templateBlock.touch();

            if (!MINIFIED){
                this.log('touch', 'Touching block: '+blockName, templateBlock.getTouched());
            }

            return this;
        },

        /**
         * Adds block to rendered template, replacing any variables that
         * have been set with their values, then clearing the variable
         * values from the variableCache.
         *
         * The primary use-case for parse() is repeatedly adding a block
         * within a loop.
         *
         * For example, using the template ...
         *
         * <ul>
         *     <!-- BEGIN li -->
         *     <li>{{name}}</li>
         *     <!-- END li -->
         * </ul>
         *
         * ... we would generate a list of names like this ...
         *
         * var names = ['Larry','Moe','Curly'];
         *
         * for (var i=0;i<names.length;i++){
         *
         *     template.set('name',names[i]);
         *     template.parse('li');
         * }
         *
         * return template.render();
         *
         * ... which would return ...
         *
         * <ul>
         *     <li>Larry</li>
         *     <li>Moe</li>
         *     <li>Curly</li>
         * </ul>
         *
         * @param blockName The name of the block to parse
         * @param touchBlock If false, variables are replaced but block is not added to rendered template
         * @return {Object} TemplateBlock object containing parsed content
         */
        parse : function(blockName,touchBlock){

            if (!MINIFIED){
                this.log('parse', 'Parsing block: '+blockName);
            }

            blockName                       = (typeof blockName === 'undefined') ? '__root__' : blockName;
            touchBlock                      = (typeof touchBlock === 'undefined') ? true : touchBlock;

            var templateBlock               = this.getBlock(blockName);

            if (touchBlock){
                templateBlock.setTouched(1);
            } else {
                templateBlock.setTouched(0);
            }

            this.currentBlock               = templateBlock.getName();

            this.parseBlock(templateBlock);
            this.clearUsedVariablesFromCache();
            this.clearScope(false);

            templateBlock.setTouched(0);

            this.currentBlock               = '__root__';

            return templateBlock;
        },

        /**
         * Renders block, parsing it and returning it as a string.
         *
         * If no blockName is specified, the entire template is parsed.
         *
         * @param blockName The name of the block to render
         * @return {String} Rendered template string
         */
        render : function(blockName){

            blockName                       = (typeof blockName === 'undefined') ? '__root__' : blockName;

            if (!MINIFIED){
                this.log('render', 'Rendering '+blockName);
            }

            var templateBlock               = this.parse(blockName);
            var templateString              = trim(templateBlock.getParsedContent().join("\n"));

            this.clearScope();
            templateBlock.reset();

            return templateString;
        },

        /**
         * Gets the parsed content of the specified block, without actually touching it
         * (so it won't appear in the rendered template itself).
         *
         * This can be used when there's content in the template that needs to be pulled
         * from the template into a variable.
         *
         * @param blockName The name of the block to snip
         * @return {String} The parsed block
         */
        snip : function(blockName){

            if (!MINIFIED){
                this.log('snip', 'Snipping block: '+blockName);
            }

            blockName                       = (typeof blockName === 'undefined') ? '__root__' : blockName;

            var templateBlock               = this.parse(blockName,false);
            var parsedContent               = templateBlock.getParsedContent();
            var templateString              = trim(parsedContent.join("\n"));

            if (templateString.length === 0){
                templateString              = templateBlock.getContent();
            }

            parsedContent                   = parsedContent.slice(0, 0 - templateBlock.getTouched());

            templateBlock.setParsedContent(parsedContent);

            this.clearScope();

            return templateString;
        },

        /**
         * Sets variables using object literal containing key:value pairs
         *
         * The object is flattened to a single-dimensional object with dot-notated
         * keys representing the nesting of the object.
         *
         * For example:
         *
         * {
         *     name : {
         *         first : 'Brad',
         *         last : 'Pitt'
         *     }
         * }
         *
         * ... becomes ...
         *
         * {
         *     'name.first' : 'Brad',
         *     'name.last' : 'Pitt'
         * }
         *
         * ... which would replace template vars named {{name.first}} and {{name.last}}
         *
         * @param obj
         * @param ignoreScope
         */
        setObjectVars : function(obj,ignoreScope){

            var flattenedObj                = flattenObj(obj);

            if (!MINIFIED){

                this.log('setObject', 'Setting object vars', {

                    originalObj             : obj,
                    flattenedObj            : flattenedObj

                }, 'DEBUG');
            }

            for (var i in flattenedObj){

                if (flattenedObj.hasOwnProperty(i)){
                    this.set(i,flattenedObj[i],ignoreScope);
                }
            }
        },

        /**
         * Gets TemplateBlock object
         *
         * @param blockName The name of the block to get
         * @return {Object}
         */
        getBlock : function(blockName){

            if (!this.hasBlock(blockName)){
                throw new Error('['+this.name+' Brightline.getBlock()] Cannot get non-existent block: '+blockName);
            }

            return this.blocks.getChild(blockName);
        },

        /**
         * Checks whether block exists
         *
         * @param blockName The name of the block to check
         * @return {Boolean}
         */
        hasBlock : function(blockName){
            return this.blocks.has(blockName);
        },

        /**
         * Processes template string, extracting all blocks and variables
         * into TemplateBlock objects
         *
         * @param templateString String containing template markup
         */
        process : function(templateString){

            if (!MINIFIED){
                this.log('process', 'Processing template string', { templateString : templateString } , 'DEBUG');
            }

            var rootBlock                   = new TemplateBlock('__root__');
            rootBlock.setContent(templateString);

            this.findBlocks(rootBlock);
            this.insertChildBlockPlaceholders(rootBlock);
            this.findVariablesInBlockContent(rootBlock);

            if (!this.blocks.has('__root__')){
                this.blocks.addParent(rootBlock);
            }
        },

	compile : function(name){

	    if (!window.BrightlineCache){
		window.BrightlineCache = {};
	    }

	    window.BrightlineCache[name] = JSON.stringify(this.blocks);

	    return (function(n){

		return function(){
		    return new Brightline().load(n);
		}

	    }(name));
	},

	load : function(name){

	    var obj                         = JSON.parse(window.BrightlineCache[name]);

	    this.blocks.childParentMap      = obj.childParentMap;
	    this.blocks.numNodes            = obj.numNodes;
	    this.blocks.tree                = obj.tree;

	    for (var blockName in obj.nodes){

		if (obj.nodes.hasOwnProperty(blockName)){

		    var templateBlock       = new TemplateBlock(blockName);
		    var thisNode            = obj.nodes[blockName];

		    for (var prop in thisNode){

			if (thisNode.hasOwnProperty(prop)){
			    templateBlock[prop] = thisNode[prop];
			}
		    }

		    this.blocks.nodes[blockName] = templateBlock;
		}
	    }

	    return this;
	},

        /**
         * Recursively finds blocks in TemplateBlock content
         *
         * Blocks look like:
         *
         * <!-- BEGIN myBlock -->
         * Blah Blah {{variable}} blah blah
         * <!-- END myBlock -->
         *
         * @param parentBlock The TemplateBlock containing the content to search for blocks
         */
        findBlocks : function(parentBlock){

            var pattern                     = /<!--\s+BEGIN\s+([\.0-9A-Za-z:|_-]+)\s+-->([\s\S]*)<!--\s+END\s+\1\s+-->/mg;
            var parentBlockContent          = parentBlock.getContent();
            var foundBlocks                 = parentBlockContent.match(pattern);
            var self                        = this;

            if (foundBlocks){

                if (!MINIFIED){
                    this.log('findBlocks', 'Found blocks in '+parentBlock.getName(), foundBlocks , 'DEBUG');
                }

                for (var i=0;i<foundBlocks.length;i++){

                    var foundBlock          = new RegExp(pattern).exec(foundBlocks[i]);

                    if (foundBlock){

                        var blockName       = foundBlock[1];
                        var templateBlock   = new TemplateBlock(blockName);

                        templateBlock.setContent(foundBlock[2]);

                        if (self.blocks.has(blockName)){
                            throw new Error('['+this.name+' Brightline.findBlocks()] Duplicate block name: '+blockName+'. Block names must be unique.');
                        }

                        self.blocks.addChild(parentBlock,templateBlock);
                        self.findBlocks(templateBlock);
                        self.insertChildBlockPlaceholders(templateBlock);
                        self.findVariablesInBlockContent(templateBlock);
                    }
                }
            }
        },

        /**
         * Inserts placeholders for child blocks found in TemplateBlock.
         *
         * <!-- BEGIN myBlock -->
         *     Some content
         * <!-- END myBlock -->
         *
         * ... is replaced with ...
         *
         * {{__myBlock__}}
         *
         * @param templateBlock The TemplateBlock into which to insert child block placeholders
         */
        insertChildBlockPlaceholders : function(templateBlock){

            if (this.blocks.hasChildren(templateBlock)){

                if (!MINIFIED){
                    this.log('insertChildBlockPlaceholders', 'Inserting child block placeholders in '+templateBlock.getName(), templateBlock , 'DEBUG');
                }

                var childBlocks             = this.blocks.getChildren(templateBlock);
                var self                    = this;

                for (var i in childBlocks){

                    if (childBlocks.hasOwnProperty(i)){

                        (function(childBlock){

                            var childBlockName          = childBlock.getName();
                            var parentBlockContent      = templateBlock.getContent();
                            var childBlockPattern       = '<!--\\s+BEGIN\\s+'+childBlockName+'\\s+-->([\\s\\S]*)<!--\\s+END\\s+'+childBlockName+'\\s+-->';
                            var matches                 = parentBlockContent.match(childBlockPattern);

                            if (matches){

                                if (!MINIFIED){
                                    self.log('insertChildBlockPlaceholders', ' --> Inserting placeholder for '+childBlockName, null , 'DEBUG');
                                }

                                templateBlock.setContent(parentBlockContent.replace(matches[0],'{{__'+childBlockName+'__}}'));
                            }

                        }(childBlocks[i]));
                    }
                }
            }
        },

        /**
         * Finds variables in TemplateBlock
         *
         * Variables look like {{someVar}}
         *
         * @param templateBlock The TemplateBlock in which to find variables
         */
        findVariablesInBlockContent : function(templateBlock){

            var pattern                     = /(?!\{{__[\.0-9A-Za-z\*:|_-]+__\}})\{{([\.0-9A-Za-z\*:|_-]+)\}}/mg;
            var variableArray               = [];
            var foundVariables              = templateBlock.getContent().match(pattern);

            if (foundVariables){

                if (!MINIFIED){

                    this.log('findVariablesInBlockContent', 'Found variables in '+templateBlock.getName(), {

                        templateBlock           : templateBlock,
                        foundVariables          : foundVariables

                    }, 'DEBUG');
                }

                for (var i=0;i<foundVariables.length;i++){

                    if (!inArray(variableArray,foundVariables[i])){

                        var rawVariableName = foundVariables[i].replace('{{','').replace('}}','');
                        variableArray.push(rawVariableName);
                    }
                }

                templateBlock.setVariables(variableArray);
            }
        },

        /**
         * Parses block, replacing variables with values and child block placeholders
         * with parsed child block content
         *
         * @param templateBlock The TemplateBlock with the content to parse
         * @return {*}
         */
        parseBlock : function(templateBlock){

            if (!MINIFIED){
                this.log('parseBlock', 'Parsing '+templateBlock.getName(), templateBlock , 'DEBUG');
            }

            var childBlocks                 = this.blocks.getChildren(templateBlock);

            for (var i in childBlocks){

                if (childBlocks.hasOwnProperty(i)){
                    this.parseBlock(childBlocks[i]);
                }
            }

            this.currentBlock               = templateBlock.getName();

            this.replaceBlockVariables(templateBlock);
            this.replaceChildBlockPlaceholders(templateBlock);

            templateBlock.setTouched(0);

            return templateBlock;
        },

        /**
         * Replaces variables in block with values. Any variables for which values
         * haven't been set are replaced with empty strings.
         *
         * @param templateBlock The TemplateBlock with the variables to replace
         */
        replaceBlockVariables : function(templateBlock){

            var blockContent                = templateBlock.getContent();
            var blockVariables              = templateBlock.getVariables();
            var blockName                   = templateBlock.getName();
            var blockVariableCache          = templateBlock.getVariableCache();

            if (blockVariables.length > 0){

                if (!MINIFIED){
                    this.log('replaceBlockVariables', 'Replacing block variables in '+templateBlock.getName(), templateBlock , 'DEBUG');
                }

                for (var i=0;i<blockVariables.length;i++){

                    var variableName        = blockVariables[i];
                    var placeholder         = '{{'+variableName+'}}';

                    if (blockName === this.currentBlock){

                        if (variableName in blockVariableCache){

                            blockContent    = blockContent.replace(placeholder,blockVariableCache[variableName]);

                            if (!MINIFIED){
                                this.log('replaceBlockVariables', ' --> Replacing block variable "'+variableName+'" with "'+templateBlock.variableCache[variableName]+'" from template block', null , 'DEBUG');
                            }

                            templateBlock.setUsedVariable(variableName,true);
                            templateBlock.touched       = 1;

                        } else if (variableName in this.variableCache && !templateBlock.isAlreadyParsed(variableName)){

                            blockContent    = blockContent.replace(placeholder,this.variableCache[variableName]);

                            if (!MINIFIED){
                                this.log('replaceBlockVariables', ' --> Replacing block variable "'+variableName+'" with "'+this.variableCache[variableName]+'" from variable cache', null , 'DEBUG');
                            }

                            this.usedVariables[variableName] = true;
                            templateBlock.touched       = 1;

                        } else {

                            if (!MINIFIED){
                                this.log('replaceBlockVariables', ' --> Replacing block variable "'+variableName+'" with empty string', null , 'DEBUG');
                            }

                            blockContent    = blockContent.replace(placeholder,'');
                        }

                    } else {

                        if (!MINIFIED){
                            this.log('replaceBlockVariables', ' --> Replacing block variable "'+variableName+'" with empty string', null , 'DEBUG');
                        }

                        blockContent        = blockContent.replace(placeholder,'');
                    }
                }
            }

            var blockTouched                = templateBlock.getTouched();

            for (var j=0;j<blockTouched;j++){
                templateBlock.addParsedContent(blockContent);
            }
        },

        /**
         * Replaces child block placeholders with parsed child block content
         *
         * @param templateBlock The TemplateBlock containing the child block placeholders to replace
         */
        replaceChildBlockPlaceholders : function(templateBlock){

            var parsedContent               = this.getParsedContent(templateBlock);
            var childBlocks                 = this.blocks.getChildren(templateBlock);

            if (!isEmpty(childBlocks)){

                if (!MINIFIED){
                    this.log('replaceChildBlockPlaceholders', 'Replacing child block placeholders in '+templateBlock.getName(), { parsedContent : parsedContent } , 'DEBUG');
                }

                for (var i in childBlocks){

                    if (childBlocks.hasOwnProperty(i)){

                        var placeholder     = '{{__'+childBlocks[i].getName()+'__}}';
                        var replacement     = trim(childBlocks[i].parsedContent.join(''));

                        for (var j in parsedContent){

                            if (parsedContent.hasOwnProperty(j) && parsedContent[j].indexOf(placeholder) > -1){

                                if (!MINIFIED){
                                    this.log('replaceChildBlockPlaceholders', ' --> Replacing child block '+placeholder, { replacement : replacement } , 'DEBUG');
                                }

                                parsedContent[j]        = parsedContent[j].replace(placeholder,replacement);
                            }
                        }

                        childBlocks[i].parsedContent    = [];
                    }
                }

                templateBlock.setParsedContent(parsedContent);
            }
        },

        /**
         * Gets the parsed content from the TemplateBlock
         *
         * If the TemplateBlock doesn't have any parsed content, but its child blocks do,
         * then the TemplateBlock is parsed now.
         *
         * @param templateBlock The TemplateBlock from which to get parsed content
         * @return {*}
         */
        getParsedContent : function(templateBlock){

            if (templateBlock.parsedContent.length === 0 && this.blocks.hasChildren(templateBlock)){

                var childBlocks             = this.blocks.getChildren(templateBlock);

                for (var i in childBlocks){

                    if (childBlocks.hasOwnProperty(i)){

                        if (childBlocks[i].parsedContent.length > 0){

                            this.touch(templateBlock.getName());
                            this.replaceBlockVariables(templateBlock);
                            break;
                        }
                    }
                }
            }

            if (!MINIFIED){
                this.log('getParsedContent', 'Getting parsed content for '+templateBlock.getName(), { parsedContent : templateBlock.parsedContent } , 'DEBUG');
            }

            return templateBlock.getParsedContent();
        },

        /**
         * Clears variables which have been used from the variable cache
         */
        clearUsedVariablesFromCache : function(){

            if (!MINIFIED){
                this.log('clearUsedVariablesFromCache', 'Clearing used variables from cache', this.usedVariables , 'DEBUG');
            }

            for (var varName in this.usedVariables){

                if (this.usedVariables.hasOwnProperty(varName)){

                    try {
                        delete this.variableCache[varName];
                    } catch (e) {
                        this.variableCache[varName] = undefined;
                    }
                }
            }

            this.usedVariables              = [];
        },

        /**
         * Checks whether a key and a value is a valid pair:
         * the key is a string and the value is scalar and, if it
         * is a string, is non-empty
         *
         * @param key The key to check
         * @param value The value to check
         * @return {Boolean}
         */
        isValidKeyValuePair : function(key,value){
            return (typeof key === 'string') && ((typeof value === 'string' && value.length > 0) || typeof value === 'number' || typeof value === 'boolean');
        }
    };

    /* If RequireJS define() is present, use it to export Brightline */
    if (typeof define === "function") {

        define(function() {
            return Brightline;
        });
    }
    /* Otherwise, add Brightline to global namespace */
    else {

        window.Brightline = Brightline;
    }

}(window));