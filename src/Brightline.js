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

    var Brightline = function Brightline(initObj) {

        if (typeof initObj !== 'object' || initObj === null){

            var errorMsg = 'Brightline constructor must be passed an initialization object';

            throw new Error(errorMsg);
        }

        this.setDefaults();

        this.setLogLevel(initObj.logLevel);
        this.setName(initObj.name);
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
         * Initializes instance properties with default values
         */
        setDefaults : function(){

            this.blocks                         = {};
            this.currentBlock                   = null;
            this.currentScope                   = null;
            this.logLevel                       = 'ERROR';
            this.name                           = 'Brightline';
            this.usedVariables                  = {};
            this.variableCache                  = {};
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

        /**
         * Sets the name for this Brightline instance
         *
         * @param name Instance name
         */
        setName : function(name) {
            this.name = name || this.name;
        },

        /**
         * Sets the log level
         *
         * @param level Log level (OFF, ERROR, WARN, INFO, or DEBUG)
         */
        setLogLevel : function(level) {
            this.logLevel = level || this.logLevel;
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