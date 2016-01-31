(function(){
    "use strict";

    var Zebra = function(){
        this.information = {};
        Object.defineProperties(this.information, {
            "version": {
                value: "0.01",
                configurable: false,
                writable: false,
                enumerable: false
            },
            "creator": {
                value: "Zebrev Nickolai",
                configurable: false,
                writable: false,
                enumerable: false
            },
            "creator_email": {
                value: "xopxem@gmail.com",
                configurable: false,
                writable: false,
                enumerable: false
            }
        });

        var CollectionController = {};
        var CollectionDirective = {};
        var CollectionIterator = {};
        var CollectionRoute = {};
        var Config;

        var Property = {
            $iterator: function (name, $element, arr, scope) {
                if (typeof name !== "string") {
                    console.error("The $iterator must have string first arguments");
                }
                if (typeof arr !== "object" && !(arr instanceof Array)) {
                    console.error("The $iterator must have array third arguments");
                }
                if (typeof $element !== "string") {
                    console.error("The $iterator must have string second arguments");
                }
                var interval = setInterval(function(){
                    if(document.getElementById($element) !== null){
                        CollectionIterator[name].initialisation(document.getElementById($element), arr, scope);
                        clearInterval(interval);
                    }
                }, 100);

            },
            $directive: function (name, $element, obj, scope) {
                if (typeof name !== "string") {
                    console.error("The $iterator must have string first arguments");
                }
                if (typeof $element !== "string") {
                    console.error("The $iterator must have string second arguments");
                }
                var interval = setInterval(function(){
                    if(document.getElementById($element) !== null){
                        CollectionDirective[name].newAppend(document.getElementById($element), obj, scope);
                        clearInterval(interval);
                    }
                }, 100);

            },
            $router: {
                att : document.createElement ('a'),
                when : function (path, route) {

                    if(typeof route !== "object" || !(route instanceof Array)) {
                        console.error("The Router " + path + " has second argument only Array");
                    }
                    var res = pathRegExp (path);
                    var repath = {
                        url: path,
                        regex: new RegExp ('^(?:\/*?)(?:\#*?)(?:\!*?)' + res.regex + '/?$', 'g'),
                        params: res.params
                    };
                    CollectionRoute[path] = new Route(repath,route);

                    return this;

                },
                otherwise : function (params) {
                    if (typeof params === 'string') {
                        params = {redirectTo: params};
                    }
                    this.when(null, params);
                    return this;
                },
                get_path : function (url) {
                    this.att.href = url;
                    return this.att.pathname + this.att.search + this.att.hash;
                },
                route : function (url) {
                    var self = this;
                    var path = self.get_path (url);
                    for (var i in CollectionRoute) {
                        var matches = CollectionRoute[i].path.regex.exec (path);
                        CollectionRoute[i].path.regex.lastIndex = 0;
                        if (matches !== null) {
                            if (matches.length > 1) {
                                matches.shift ();
                            }
                            CollectionRoute[i].initialisation (matches);
                            break;
                        }
                    }
                }
            },
            $is:{
                empty: function(obj) {
                    if (obj == null) return true;
                    if (obj.length > 0)    return false;
                    if (obj.length === 0)  return true;

                    for (var key in obj) {
                        if (hasOwnProperty.call(obj, key)) return false;
                    }

                    return true;
                },
                Object: function (value) {
                    var type = typeof value;
                    return !!value && (type == 'object' || type == 'function');
                },
                Equal : function(newObj, oldObj){
                    var clone = "function" === typeof newObj.pop ? [] : {},
                        changes = 0,
                        prop = null,
                        result = null,
                        check = function(o1, o2) {
                            for(prop in o1) {
                                if(!o1.hasOwnProperty(prop)) continue;
                                if(o1[prop] instanceof Date){
                                    if(!(o2[prop] instanceof Date && o1[prop].getTime() == o2[prop].getTime())){
                                        clone[prop] = newObj[prop];
                                        changes++;
                                    }
                                }else if (o1[prop] && o2[prop] && "object" === typeof o1[prop]) {
                                    if(result = compareObjects(newObj[prop], oldObj[prop])){
                                        clone[prop] = "function" === typeof o1[prop].pop ? newObj[prop] : result;
                                        changes++;
                                    }
                                }else if(o1[prop] !== o2[prop]){
                                    clone[prop] = newObj[prop];
                                    changes++;
                                }
                            }
                        };
                    check(newObj, oldObj);
                    check(oldObj, newObj);
                    return changes ? clone : false;
                }
            },
            $on:function(object ,events, callback){
                document.querySelector(object).addEventListener(events, callback, false);
            },
            $initialiseParam : function(caller){
                var self = this;
                var array_arguments = [];
                if(self[caller] instanceof Array) {
                    self[caller].slice(0, self[caller].length - 1).forEach(function(item, index){
                        array_arguments.push(item);
                    });
                } else if(self[caller] instanceof Function) {
                    self[caller].toString()
                        .match(new RegExp('(\s*?)function(\s*?)\((.*?)\)\{',''))[0]
                        .replace(/^function(\s*?)\(/g,"")
                        .replace(/\)\{*/, "")
                        .replace(/\s/g, "")
                        .split(",")
                        .forEach(function(item, index){

                            array_arguments.push(item);

                        });
                }
                return array_arguments;
            },
            $initDirective: function($element, obj, Scope){
                var self = this;
                var scope = new Scope();
                scope.model = obj;
                if(typeof self.filter === "undefined" || self.filter(scope.model)){
                    var direct = CollectionDirective[self.directive || self.name];

                    var $render =  function(){
                        render()
                    };
                    var $remove =  function(){
                        remove()
                    };

                    var collection = {
                        params : direct.initialisation(scope, $render, $remove),
                        el : !!direct.$el?direct.$el:"div",
                        classStr : direct.classInst == "function"?direct.classStr(scope.model):direct.classStr

                    };
                    var parent = $element;
                    var aEl  = document.createElement(collection.el);
                    var remove = function(){
                        parent.removeChild(aEl);
                    };
                    var render = function(){
                        aEl.innerHTML = (collection.params.template)(scope);
                        aEl.className = collection.classStr;
                        collection.params.link(scope, aEl);
                        if(!Property.$is.empty(collection.params.event)){
                            for(var itemEvent in direct.event)(function(item,id, events, params, property,aEl ){
                                var itemArray = item.split(" ");
                                var method = itemArray[0];
                                itemArray.shift();
                                var object = itemArray.join(" ");
                                if(!!object){
                                    var elements = aEl.querySelectorAll(object);
                                    for (var i = 0; i < elements.length; i++) {
                                        elements[i].addEventListener(method,  params[events[itemEvent]], false)
                                    }
                                } else {
                                    aEl.addEventListener(method,  params[events[itemEvent]], false);
                                }
                            })(itemEvent, collection.idStr, direct.event, collection.params.event, Property, aEl);
                        }
                    };

                    render();
                    parent.appendChild(aEl);

                }
            }
        };


        function pathRegExp (url) {
            var res = {
                url: url,
                regex: null,
                params: []
            };
            var matches = url.match (/\:([a-zA-Z0-9_]+)/g);
            if (matches !== null) {
                for (var i in matches) {
                    matches[i] = matches[i].substring (1);
                }
                res.params = matches;
                url = url.replace (/\:([a-zA-Z0-9_]+)/g, '(.*?)');
            }

            res.regex = url.replace ('/', '\\/');

            return res;
        }

        var Scope = function(){
            this.$$watchers = [];
            this.$$asyncQueue = [];
            this.$$postDigestQueue = [];
            this.$$phase = null;
        };

        Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
            var self = this;
            var watcher = {
                watchFn: watchFn,
                listenerFn: listenerFn || function() { },
                valueEq: !!valueEq
            };
            self.$$watchers.push(watcher);
            return function() {
                var index = self.$$watchers.indexOf(watcher);
                if (index >= 0) {
                    self.$$watchers.splice(index, 1);
                }
            };
        };

        Scope.prototype.$beginPhase = function(phase) {
            if (this.$$phase) {
                throw this.$$phase + ' already in progress.';
            }
            this.$$phase = phase;
        };

        Scope.prototype.$clearPhase = function() {
            this.$$phase = null;
        };

        Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
            if (valueEq) {
                return Property.$is.Equal(newValue, oldValue);
            } else {
                return newValue === oldValue ||
                    (typeof newValue === 'number' && typeof oldValue === 'number' &&
                    isNaN(newValue) && isNaN(oldValue));
            }
        };

        Scope.prototype.$$digestOnce = function() {
            var self  = this;
            var dirty;
            this.$$watchers.forEach(function(watch) {
                try {
                    var newValue = watch.watchFn(self);
                    var oldValue = watch.last;
                    if (!self.$$areEqual(newValue, oldValue, watch.valueEq)) {
                        watch.listenerFn(newValue, oldValue, self);
                        dirty = true;
                    }
                    watch.last = (watch.valueEq ? Object.create(newValue) : newValue);
                } catch (e) {
                    (console.error || console.log)(e);
                }
            });
            return dirty;
        };

        Scope.prototype.$digest = function() {
            var ttl = 10;
            var dirty;
            this.$beginPhase("$digest");
            do {
                while (this.$$asyncQueue.length) {
                    try {
                        var asyncTask = this.$$asyncQueue.shift();
                        this.$eval(asyncTask.expression);
                    } catch (e) {
                        (console.error || console.log)(e);
                    }
                }
                dirty = this.$$digestOnce();
                if (dirty && !(ttl--)) {
                    this.$clearPhase();
                    throw "10 digest iterations reached";
                }
            } while (dirty);
            this.$clearPhase();

            while (this.$$postDigestQueue.length) {
                try {
                    this.$$postDigestQueue.shift()();
                } catch (e) {
                    (console.error || console.log)(e);
                }
            }
        };
        Scope.prototype.$eval = function(expr, locals) {
            return expr(this, locals);
        };

        Scope.prototype.$apply = function(expr) {
            try {
                this.$beginPhase("$apply");
                return this.$eval(expr);
            } finally {
                this.$clearPhase();
                this.$digest();
            }
        };

        Scope.prototype.$evalAsync = function(expr) {
            var self = this;
            if (!self.$$phase && !self.$$asyncQueue.length) {
                setTimeout(function() {
                    if (self.$$asyncQueue.length) {
                        self.$digest();
                    }
                }, 0);
            }
            self.$$asyncQueue.push({scope: self, expression: expr});
        };

        Scope.prototype.$$postDigest = function(fn) {
            this.$$postDigestQueue.push(fn);
        };

        var Configuration = function(controller, obj){
            this.initialize = obj.initialize || function(){};
            CollectionController[controller].initialisation();
            this.$scope = CollectionController[controller].$scope;
        };

        Configuration.prototype.initialisation = function(){

            var self = this;
            var array_arguments = [];

            Property.$initialiseParam.call(self,"initialize").forEach(function(item){
                array_arguments.push(Property[item]);
            });
            if(self.initialize instanceof Array) {
                self.initialize.slice(self.initialize.length - 1)[0].apply(self, array_arguments);
            } else if(self.initialize instanceof Function) {
                self.initialize.apply(self, array_arguments);
            }


        };

        this.Configuration = function(controller, obj){

            if(typeof Config !== "undefined") {
                console.error("Sorry, Configuration is initialisation!");
            }

            if(typeof obj !== "object" || !(obj instanceof Object && !(obj instanceof Array))) {
                console.error("The Configuration has second arguments only Object");
            }

            Config =  new Configuration(controller, obj);
            Config.initialisation();
            Property.$router.route(window.location.href);

            return this;
        };



        var Controller = function(name, obj){
            this.name = name;
            this.template = obj.template || "";
            this.place_id = obj.place_id || "";
            this.initialize = obj.initialize || function(){};
            this.$scope = new Scope();

        };

        Controller.prototype.initialisation = function(place_id, routeParams){

            var self = this;
            var element_inner = !!place_id?document.getElementById(place_id):"";
            var array_arguments = [];

            if(typeof Config !== "undefined") {
                self.$scope.$parent = Config.$scope;
            }

            setInterval(function(){
                self.$scope.$digest();
            }, 100);

            Property.$initialiseParam.call(self, "initialize").forEach(function(item){
                switch (item){
                    case "$scope":
                        array_arguments.push(self[item]);
                        break;
                    case "$routeParams":
                        array_arguments.push(routeParams);
                        break;
                    default:
                        array_arguments.push(Property[item]);
                        break;
                }
            });
            if(self.initialize instanceof Array) {
                self.initialize.slice(self.initialize.length - 1)[0].apply(self, array_arguments);
            } else if(self.initialize instanceof Function) {
                self.initialize.apply(self, array_arguments);
            }

            if(!!element_inner){
                
                element_inner.innerHTML = (self.template)(self.$scope);
            }
            return this;
        };




        this.Controller = function(name, obj){

            if(typeof obj !== "object" || !(obj instanceof Object && !(obj instanceof Array) && !(obj instanceof Function))) {
                console.error("The Controller " + name + " has arguments only Object");
            }

            CollectionController[name] =  new Controller(name, obj);

            return this;
        };


        var Directive = function(name, obj){
            this.name = name;
            this.template = obj.template || "";
            this.$el = obj.$el || "";
            this.classStr = obj.class || "";
            this.event = obj.event || {};
            this.classInst = this.classStr instanceof Function? "function": "string";
            this.link = obj.link || function(){};
            this.initialize = obj.initialize || function(){};
        };

        Directive.prototype.initialisation = function($scope, $render, $remove){
            var self = this;
            var array_arguments = [];
            var event = {

            };
            var $event = function(name, callback){
                if(!(callback  instanceof Function)){
                    console.error("The $event " + name + " has't arguments");
                }
                event[name] = callback;
            };

            setInterval(function(){
                $scope.$digest();
            }, 100);


            Property.$initialiseParam.call(self, "initialize").forEach(function(item){
                switch (item){
                    case "$scope":
                        array_arguments.push($scope);
                        break;
                    case "$event":
                        array_arguments.push($event);
                        break;
                    case "$render":
                        array_arguments.push($render);
                        break;
                    case "$remove":
                        array_arguments.push($remove);
                        break;
                    default:
                        array_arguments.push(Property[item]);
                        break;
                }
            });

            if(self.initialize instanceof Array) {
                self.initialize.slice(self.initialize.length - 1)[0].apply(self, array_arguments);
            } else if(self.initialize instanceof Function) {
                self.initialize.apply(self, array_arguments);
            }
            return {
                template : self.template,
                event: event,
                link : self.link,
                render: $render,
                remove: $remove
            }
        };



        Directive.prototype.newAppend = function($element, item, scope){

            var isolateScope = Scope;
            isolateScope.prototype.$parent = scope;

            var self = this;
            var array_arguments = [];
            Property.$initDirective.call(self, $element, item, isolateScope);

        };

        this.Directive = function(name, obj){

            if(typeof obj !== "object" || !(obj instanceof Object && !(obj instanceof Array) && !(obj instanceof Function))) {
                console.error("The Directive " + name + " has arguments only Object");
            }

            CollectionDirective[name] =  new Directive(name, obj);

            return this;
        };


        var Route = function(repath, obj){
            this.path = repath || {};
            this.controllers = obj || [];
        };

        Route.prototype.initialisation = function(attrsRoute){

            var self = this;
            var len_cont = self.controllers.length;
            var paramsRoute = {};

            for(var param in self.path.params){
                paramsRoute[self.path.params[param]] = attrsRoute[param];
            }

            for(var count = 0; count < len_cont; count++){
                CollectionController[self.controllers[count].controller].initialisation(self.controllers[count].place_id, paramsRoute);
            }
        };

        var Iterator = function(name, obj){
            this.name = name;
            this.directive = obj.directive || "";
            this.filter = obj.filter || function(){return true};
        };

        Iterator.prototype.initialisation = function($element, arr, scope){
            var isolateScope = Scope;
            isolateScope.prototype.$parent = scope;
            var self = this;
            var array_arguments = [];
            $element.innerHTML = "";
            arr.forEach(function(item, index){
                Property.$initDirective.call(self, $element, item, isolateScope);
            })

        };




        this.Iterator = function(name, obj){

            if(typeof obj !== "object" || !(obj instanceof Object && !(obj instanceof Array) && !(obj instanceof Function))) {
                console.error("The Iterator " + name + " has arguments only Object");
            }

            CollectionIterator[name] =  new Iterator(name, obj);

            return this;
        };
        window.addEventListener("hashchange", function(){

            Property.$router.route(window.location.href);
        }, false);
    };
    window.Zebra = Zebra;

})();



(function() {
    "use strict";

    var doT = {
        version: "1.0.3",
        templateSettings: {
            evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
            interpolate: /\{\{=([\s\S]+?)\}\}/g,
            encode:      /\{\{!([\s\S]+?)\}\}/g,
            use:         /\{\{#([\s\S]+?)\}\}/g,
            useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
            define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
            defineParams:/^\s*([\w$]+):([\s\S]+)/,
            conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
            iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
            varname:	"it",
            strip:		true,
            append:		true,
            selfcontained: false,
            doNotSkipEncoded: false
        },
        template: undefined, //fn, compile template
        compile:  undefined  //fn, for express
    }, _globals;

    doT.encodeHTMLSource = function(doNotSkipEncoded) {
        var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
            matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
        return function(code) {
            return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
        };
    };

    _globals = (function(){ return this || (0,eval)("this"); }());

    if (typeof module !== "undefined" && module.exports) {
        module.exports = doT;
    } else if (typeof define === "function" && define.amd) {
        define(function(){return doT;});
    } else {
        _globals.doT = doT;
    }

    var startend = {
        append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
        split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
    }, skip = /$^/;

    function resolveDefs(c, block, def) {
        return ((typeof block === "string") ? block : block.toString())
            .replace(c.define || skip, function(m, code, assign, value) {
                if (code.indexOf("def.") === 0) {
                    code = code.substring(4);
                }
                if (!(code in def)) {
                    if (assign === ":") {
                        if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
                            def[code] = {arg: param, text: v};
                        });
                        if (!(code in def)) def[code]= value;
                    } else {
                        new Function("def", "def['"+code+"']=" + value)(def);
                    }
                }
                return "";
            })
            .replace(c.use || skip, function(m, code) {
                if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
                    if (def[d] && def[d].arg && param) {
                        var rw = (d+":"+param).replace(/'|\\/g, "_");
                        def.__exp = def.__exp || {};
                        def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
                        return s + "def.__exp['"+rw+"']";
                    }
                });
                var v = new Function("def", "return " + code)(def);
                return v ? resolveDefs(c, v, def) : v;
            });
    }

    function unescape(code) {
        return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
    }

    doT.template = function(tmpl, c, def) {
        c = c || doT.templateSettings;
        var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
            str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

        str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
            .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
            .replace(/'|\\/g, "\\$&")
            .replace(c.interpolate || skip, function(m, code) {
                return cse.start + unescape(code) + cse.end;
            })
            .replace(c.encode || skip, function(m, code) {
                needhtmlencode = true;
                return cse.startencode + unescape(code) + cse.end;
            })
            .replace(c.conditional || skip, function(m, elsecase, code) {
                return elsecase ?
                    (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
                    (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
            })
            .replace(c.iterate || skip, function(m, iterate, vname, iname) {
                if (!iterate) return "';} } out+='";
                sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
                return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
                    +vname+"=arr"+sid+"["+indv+"+=1];out+='";
            })
            .replace(c.evaluate || skip, function(m, code) {
                return "';" + unescape(code) + "out+='";
            })
        + "';return out;")
            .replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
            .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
        //.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

        if (needhtmlencode) {
            if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
            str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
                + doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
                + str;
        }
        try {
            return new Function(c.varname, str);
        } catch (e) {
            if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
            throw e;
        }
    };

    doT.compile = function(tmpl, def) {
        return doT.template(tmpl, null, def);
    };
}());