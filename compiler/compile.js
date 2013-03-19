var fs = require('fs');
var path = require('path');
var Brightline = require('/home/warren/lib/node_modules/brightline.js/src/Brightline');

fs.truncate('BrightlineCache.js',function(){});
fs.appendFileSync('BrightlineCache.js',"window.BrightlineCache = {};\n");

var traverseFileSystem = function (currentPath) {

    var files = fs.readdirSync(currentPath);

    for (var i in files) {

        var currentFile     = currentPath + '/' + files[i];
        var stats           = fs.statSync(currentFile);

        if (stats.isFile()) {

            var ext         = currentFile.substr(-3);

            if (ext === 'tpl'){

                (function(currentFile){

                    fs.readFile(currentFile,'utf8',function(err,data){

                        var compiled = new Brightline.Brightline(data).compile();
                        var fileName = path.basename(currentFile,'.tpl');
                        fs.appendFileSync('BrightlineCache.js',"window.__BrightlineCache['"+fileName+"'] = "+compiled+";\n");
                    });

                }(currentFile));
            }

        } else if (stats.isDirectory()) {

            traverseFileSystem(currentFile);
        }
     }
};

traverseFileSystem('.');