(function(){

    window = (typeof window !== 'undefined') ? window : null;
    global = (typeof global !== 'undefined') ? global : null;
    var root = window || global || {};
    root.__BrightlineCache = root.__BrightlineCache || {};
    root.__BrightlineCache['example'] = function(){ return {"childParentMap":{"header":"__root__","likes":"__root__","like":"likes","name":"__root__","paragraph":"__root__","pressGroup":"__root__","pressItem":"pressGroup","publication":"__root__","pageID":"__root__"},"nodes":{"__root__":{"name":"__root__","content":"{{__header__}}\n\n        <div id=\"content\">\n\n            {{__likes__}}\n\n            {{__name__}}\n\n            <h4>{{about}}</h4>\n\n            {{__paragraph__}}\n\n            <h3>Articles</h3>\n            <ul>\n                {{__pressGroup__}}\n            </ul>\n\n            <h3>As Seen On</h3>\n            <ul>\n                {{__publication__}}\n\t    </ul>\n\n\t</div>\n\n\t{{__pageID__}}","touched":0,"variables":["about"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"header":{"name":"header","content":"\n        <a href=\"{{link}}\" target=\"_blank\">\n            <img src=\"{{cover.source}}\" title=\"Visit {{name}} Facebook page\" />\n        </a>\n        ","touched":0,"variables":["link","cover.source","name"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"likes":{"name":"likes","content":"\n            <div id=\"likes\">\n                <h3>{{numLikes}} Likes</h3>\n                {{__like__}}\n            </div>\n            ","touched":0,"variables":["numLikes"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"like":{"name":"like","content":"\n                <div class=\"like\"></div>\n                ","touched":0,"variables":[],"parsedContent":[],"variableCache":{},"usedVariables":{}},"name":{"name":"name","content":"\n            <h1><a href=\"{{link}}\" title=\"Visit {{name}} website\">{{name}}</a></h1>\n            ","touched":0,"variables":["link","name","name"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"paragraph":{"name":"paragraph","content":"\n            <p>{{paragraph}}</p>\n            ","touched":0,"variables":["paragraph"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"pressGroup":{"name":"pressGroup","content":"\n                <li>\n                    <div><b>{{type}}</b></div>\n                    <ul>\n                        {{__pressItem__}}\n                    </ul>\n                </li>\n                ","touched":0,"variables":["type"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"pressItem":{"name":"pressItem","content":"\n                        <li>\n                            <a href=\"{{url}}\">{{title}}</a>\n                        </li>\n                        ","touched":0,"variables":["url","title"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"publication":{"name":"publication","content":"\n                <li>{{pubName}}</li>\n\t\t","touched":0,"variables":["pubName"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"pageID":{"name":"pageID","content":"\n    The id of this Facebook page is {{id}}\n    ","touched":0,"variables":["id"],"parsedContent":[],"variableCache":{},"usedVariables":{}}},"numNodes":10,"tree":{"__root__":["header","likes","name","paragraph","pressGroup","publication","pageID"],"likes":["like"],"pressGroup":["pressItem"]}};};;
    root.__BrightlineCache['benchmark'] = function(){ return {"childParentMap":{"list":"__root__"},"nodes":{"__root__":{"name":"__root__","content":"<div>\n    <h1 class='header'>{{header}}</h1>\n    <h2 class='header2'>{{header2}}</h2>\n    <h3 class='header3'>{{header3}}</h3>\n    <h4 class='header4'>{{header4}}</h4>\n    <h5 class='header5'>{{header5}}</h5>\n    <h6 class='header6'>{{header6}}</h6>\n    <ul class='list'>\n        {{__list__}}\n    </ul>\n</div>","touched":0,"variables":["header","header2","header3","header4","header5","header6"],"parsedContent":[],"variableCache":{},"usedVariables":{}},"list":{"name":"list","content":"\n        <li class='item'>{{listItem}}</li>\n        ","touched":0,"variables":["listItem"],"parsedContent":[],"variableCache":{},"usedVariables":{}}},"numNodes":2,"tree":{"__root__":["list"]}};};;

}());