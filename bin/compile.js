var fs                          = require('fs');
var path                        = require('path');
var colors                      = require('colors');
var Brightline                  = require('../src/Brightline');

var templatesRootDir            = process.argv[2] || '.';
var cacheDir                    = process.argv[3] || templatesRootDir;
var cache                       = "";
var templatePaths               = [];
var numCompiled                 = 0;

/**
 * Executes compilation process
 */
var exec = function(){

    console.log("\n\nBrightline compiler START".green);
    console.log("Searching for templates, starting from " + templatesRootDir);

    findTemplates(templatesRootDir,compileTemplates);
};

/**
 * Recursively finds templates based on file extension (.tpl)
 *
 * @param currentPath The path in which to find templates
 * @param done Callback to execute once all templates have been found
 */
var findTemplates = function(currentPath,done) {

    var files                   = fs.readdirSync(currentPath);

    for (var i in files) {

        var thisPath            = currentPath + '/' + files[i];
        var stats               = fs.statSync(thisPath);

        /* If the path references a .tpl file, compile the template */
        if (stats.isFile() && thisPath.substr(-4) === '.tpl') {

            templatePaths.push(thisPath);
        }
        /* If the path references a directory, recursively look for templates in it */
        else if (stats.isDirectory()) {

            findTemplates(thisPath);
        }
    }

    if (typeof done === 'function'){
        done();
    }
};

/**
 * Compiles all templates found in template dir(s)
 */
var compileTemplates = function(){

    if (templatePaths.length > 0){

        console.log('Compiling templates:');

        for (var i=0;i<templatePaths.length;i++){
            compileTemplate(templatePaths[i]);
        }

    } else {

        console.log("WARNING:".yellow + "No templates found\n\n");
    }
};

/**
 * Reads template file and compiles contents into cache string
 *
 * @param templatePath Path to the template file
 */
var compileTemplate = function(templatePath){

    console.log('--> Compiling ' + templatePath);

    fs.readFile(templatePath,'utf8',function(err,templateString){

        var compiledTemplate    = new Brightline(templateString).compile(true);
        var fileName            = path.basename(templatePath,'.tpl');

        cache                  += "    root.__BrightlineCache['"+fileName+"'] = "+compiledTemplate+";\n";
        numCompiled            += 1;

        /* If all templates have been compiled, write the cache file */
        if (templatePaths.length === numCompiled){
            writeCacheFile();
        }
    });
};

/**
 * Writes cache file containing all compiled templates as properties
 * in __BrightlineCache object, wrapped in self-executing function
 */
var writeCacheFile = function(){

    var cachePath               = cacheDir + '/BrightlineCache.js';

    console.log("Writing cache file to " + cachePath);

    var cacheFn = "\
(function(){\n\n\
    window = (typeof window !== 'undefined') ? window : null;\n\
    global = (typeof global !== 'undefined') ? global : null;\n\
    var root = window || global || {};\n\
    root.__BrightlineCache = root.__BrightlineCache || {};\n" + cache + "\n\
}());";

    /* Write new cache file */
    fs.writeFile(cachePath,cacheFn,function(err){

        if (err){

            console.log('ERROR: '.red + 'Could not write cache file to ' + cachePath + "\n\n");

        } else {
            console.log("DONE!\n\n".green);
        }
    });
};

/* Execute compilation */
exec();