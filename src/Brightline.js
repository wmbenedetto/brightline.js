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

    var console                                 = window.console || {};

    console.log                                 = (typeof console.log   === 'function') ? console.log   : function() {};
    console.info                                = (typeof console.info  === 'function') ? console.info  : console.log;
    console.error                               = (typeof console.error === 'function') ? console.error : console.log;
    console.warn                                = (typeof console.warn  === 'function') ? console.warn  : console.log;

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

    var lastNodeID                              = 0;

    var Node = function Node(nodeID){
        this.setNodeID(nodeID);
    };

    Node.prototype = {

        NODE_ID                                 : null,

        /**
         * Gets the node ID
         */
        getNodeID : function(){
            return this.NODE_ID;
        },

        /**
         * Sets the node ID
         *
         * @param nodeID The node id to use. If no nodeID is specified, one is generated automatically.
         */
        setNodeID : function(nodeID){
            this.NODE_ID                        = (typeof nodeID !== 'undefined') ? nodeID : this.generateNodeID();
        },

        /**
         * Generates a node ID by incrementing the value of the last nodeID stored in the registry
         */
        generateNodeID : function(){

            if (typeof lastNodeID === 'undefined'){
                lastNodeID                      = 0;
            }

            lastNodeID                         += 1;

            return lastNodeID;
        }
    };

    var Tree = function Tree(){

        this.nodes                              = {};
        this.numNodes                           = 0;
        this.tree                               = {};
        this.childParentMap                     = {};
    };

    Tree.prototype = {

        /**
         * Collection containing all nodes added to the Tree
         */
        nodes                                   : null,
        numNodes                                : null,

        /**
         * Object mapping parent nodeID to array of children nodeIDs
         */
        tree                                    : null,

        /**
         * Object mapping each child's nodeID to its parent's nodeID
         */
        childParentMap                          : null,

        addNode : function(node,id){

            this.nodes[id]                      = node;
            this.numNodes                      += 1;
        },

        getNode : function(id){
            return (this.hasNode(id)) ? this.nodes[id] : null;
        },

        getNodes : function(){
            return this.nodes;
        },

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

        hasNode : function(id){
            return id in this.nodes;
        },

        hasNodes : function(){
            return this.numNodes > 0;
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

            SF_Log.info('[Tree.addChild()] Adding child',{

                parent                          : parent,
                child                           : child

            },'Tree');

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

            if (!SF_Array.isArray(children)){
                throw new Error('[Tree.addChildren()] Children added to Tree must in an array');
            }

            SF_Log.info('[Tree.addChildren()] Adding children',{

                parent                          : parent,
                children                        : children

            },'Tree');

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

            return (parentNodeID in this.tree) ? this.getNodes(this.tree[parentNodeID]) : [];
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

            SF_Log.info('[Tree.removeChild()] Removing child',{

                parent                          : parent,
                child                           : child

            },'Tree');

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
                    this.tree[parentNodeID]         = undefined;
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
                children                            = this.getChildren(parent);
            }

            SF_Log.info('[Tree.removeChildren()] Removing children',{

                parent                          : parent,
                children                        : children

            },'Tree');

            for (var i in children){

                if (children.hasOwnProperty(i)){
                    this.removeChild(parent,children[i]);
                }
            }
        },

        /**
         * Checks whether the given node has a parent
         *
         * @param node The node to check
         * @return {Boolean}
         */
        isChild : function(node){
            return this.hasParent(node);
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

            if (!this.hasNodes()){
                throw new Error('[Tree.addParent()] Cannot add lone parent to a Tree that already has nodes in it. Use Tree.addChild(parent,child) instead.');
            }

            var parentNodeID                    = this.getNodeID(parent);

            if (this.hasNode(parentNodeID)){
                throw new Error('[Tree.addParent()] Parent\'s node id must be unique.');
            }

            SF_Log.info('[Tree.addParent()] Adding parent',parent,'Tree');

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

            } else if (child instanceof SF_Node){

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
         * Checks whether the given node is the parent of the specified child node
         *
         * @param parent The parent node
         * @param child The child node
         * @return {Boolean}
         */
        isParentOf : function(parent,child){
            return this.hasChild(parent,child);
        },

        /**
         * Clears the Tree
         */
        clear : function(){

            this.nodes                          = {};
            this.tree                           = {};
            this.childParentMap                 = {};
            this.numNodes                       = 0;
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

            SF_Log.info('[Tree.remove()] Removing node',node,'Tree');

            if (this.hasParent(nodeID)){

                var parent                      = this.getParent(nodeID);

                this.removeChild(parent,node);

            } else if (this.isParent(node)){

                this.removeChildren(node);
            }

            this.removeNode(nodeID);
        },

        /**
         * Gets the node's id or CLASS_ID, if no nodeID is available
         *
         * @param node The node for which to get the node id
         * @return {*}
         */
        getNodeID : function(node){

            if (typeof node === 'string' || typeof node === 'number'){
                return node;
            } else if (node instanceof SF_Node){
                return node.getNodeID();
            } else if (typeof node.CLASS_ID !== 'undefined') {
                return node.CLASS_ID;
            } else {
                throw new Error('[Tree.getNodeID()] Cannot get node ID');
            }
        }
    };

    var Brightline = function Brightline(initObj) {

        if (typeof initObj !== 'object' || initObj === null){

            var errorMsg = 'Brightline constructor must be passed an initialization object';

            throw new Error(errorMsg);
        }

        this.blocks                             = {};
        this.currentBlock                       = null;
        this.currentScope                       = null;
        this.logLevel                           = initObj.logLevel || 'ERROR';
        this.name                               = initObj.name || 'Brightline';
        this.usedVariables                      = {};
        this.variableCache                      = {};
    };

    Brightline.prototype = {

        blocks                                  : null,
        currentBlock                            : null,
        currentScope                            : null,
        logLevel                                : null,
        name                                    : null,
        usedVariables                           : null,
        variableCache                           : null,

        logLevels : {
            OFF                                 : 0,
            ERROR                               : 1,
            WARN                                : 2,
            INFO                                : 3,
            DEBUG                               : 4
        },

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
        log : function(funcName,message,payload,level) {

            payload                             = (!payload) ? '' : payload;
            level                               = (!level) ? 'INFO' : level;
            message                             = '[' + this.name + '.' + funcName + '()] ' + message;

            if (this.isLoggable(level)) {

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
        },

        /**
         * Checks whether the given level is loggable based on the
         * current log level
         *
         * @param level The level to check
         * @return {Boolean}
         */
        isLoggable : function(level){

            var currentLogLevel                 = this.logLevels[this.logLevel];
            var thisLogLevel                    = this.logLevels[level];

            return thisLogLevel <= currentLogLevel;
        },

        utils : {

            /**
             * Checks whether an item is already in the source array
             *
             * @param item The item to check
             * @param source The source array in which to look
             * @return {Boolean}
             */
            inArray : function(item,source) {

                for (var i=0;i<source.length;i++) {

                    if (item === source[i]) {
                        return true;
                    }
                }

                return false;
            },

            /**
             * Checks whether an object is an object literal (non-null, non-array)
             *
             * @param obj The object to check
             * @return {Boolean}
             */
            isObjLiteral : function(obj) {
                return typeof obj === 'object' && obj !== null && !this.isArray(obj);
            },

            /**
             * Flattens nested object into single dimensional object with dot-notated paths
             *
             * @param source The source object
             * @param pathArray Array representing nested paths
             * @param result The result object
             * @return {Object}
             */
            flattenObj : function(source,pathArray,result){

                pathArray                   = (typeof pathArray === 'undefined') ? [] : pathArray;
                result                      = (typeof result === 'undefined') ? {} : result;

                var key, value, newKey;

                for (var i in source){

                    if (source.hasOwnProperty(i)){

                        key                 = i;
                        value               = source[i];

                        pathArray.push(key);

                        if (typeof value === 'object' && value !== null){

                            result          = this.flattenObj(value,pathArray,result);

                        } else {

                            newKey          = pathArray.join('.');

                            result[newKey]  = value;
                        }

                        pathArray.pop();
                    }
                }

                return result;
            },

            /**
             * Trims leading and/or trailing whitespace from string
             *
             * @param str The string to trim
             */
            trim : function(str){
                return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            }
        }
    };

    window.Brightline = Brightline;

}(window));