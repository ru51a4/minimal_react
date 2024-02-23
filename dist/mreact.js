class superxmlparser74 {
    static parse(str, cbOpenTag, cbInnerText, cbClosedTag, cbSelfOpenTag = () => {
    }) {
        let isOpen = false;
        let startAttr = false;
        let t = ''
        let tAttrKey = '';
        let tAttrValue = '';
        let tAttrStart = false;
        let tAttr = '';
        let attr = [];
        let prevCh = '';
        for (let i = 0; i <= str.length - 1; i++) {
            //(1)<li (2)class="breadcrumb-item-selected text-gray-light breadcrumb-item text-mono h5-mktg" aria-current="GitHub Student Developer Pack"(3)>GitHub Student Developer Pack(4)</li(5)>
            //<selfclosing />
            //comments // <!-- -->
            if (str[i] === "<") { //1
                //comments <!-- -->
                if (str[i + 1] === '!' && str[i + 2] === "-" && str[i + 3] === "-") {
                    for (let j = i + 4; j <= str.length - 1; j++) {
                        if (str[j] === '-' && str[j + 1] === '-' && str[j + 2] === '>') {
                            i = j + 2;
                            break;
                        }
                    }
                    continue
                }
                ///

                if (t.trim() !== '' && t.trim() !== "\n" && t.trim() !== "\t") {
                    //cut innerTEXT 4
                    cbInnerText({
                        value: t
                    });
                    t = '';
                } else if (str[i + 1] !== "/") {
                    cbInnerText({
                        value: ""
                    });
                }
                //open tag
                isOpen = true;
                if (str[i + 1] === "/") {
                    isOpen = false;
                    i = i + 1;
                    continue;
                }
            } else if (str[i] === '>') {
                ///closed tag - build 3/5
                if (isOpen) {
                    if (prevCh === "/") {
                        cbSelfOpenTag({
                            tag: t,
                            attr: attr
                        })
                    } else {
                        cbOpenTag({
                            tag: t,
                            attr: attr,
                        })
                    }
                } else {
                    cbClosedTag({})
                }
                attr = [];
                t = '';
                startAttr = false;
                isOpen = false;
            } else {
                //accum str
                if ((!startAttr && str[i] !== ' ') || !isOpen) {
                    t += str[i];
                } else if (startAttr) { //get attr 2
                    if (str[i] === '=') {
                        tAttrKey = tAttr
                        tAttr = '';
                    } else if (str[i] === '"') {
                        tAttrStart = !tAttrStart;
                        if (tAttrStart === false) {
                            if (tAttrKey === 'class') {
                                tAttrValue = tAttr.split(" ");
                            } else {
                                tAttrValue = [tAttr];
                            }
                            tAttr = '';
                            attr.push({ key: tAttrKey, value: tAttrValue });
                            if (str[i + 1] === ' ') {
                                i = i + 1;
                                continue;
                            }
                        }
                    } else {
                        tAttr += str[i];
                    }

                } else if (str[i] === ' ' && isOpen) {
                    startAttr = true;
                }

            }
            prevCh = str[i];
        }
    }
}

class node {
    id;
    childrens = [];
    innerTEXT = '';
    parent = [];
    numChild = 0;
    tag;
    closedtag;
    visible = true;
    rIf = false;
    attr = [];
    parentComponent = '';
    left;
    right;
    rName;
}

class BuilderDOM {
    build(str) {
        //todo
        let strFix = "<dom>";
        strFix += str;
        strFix += "\n </dom>";
        return this._html_to_dom(strFix)
    }

    _html_to_dom(str) {
        let res = [];
        let parentStack = [];
        let counter = 0;
        let map = [];
        let cmap = [];
        let p = [];
        let component = '';
        let cStack = [];
        superxmlparser74.parse(str,
            (item) => {
                //opentag
                let lvl_key = JSON.stringify([p]);
                let remove = item.attr.find(c => c['key'] == "r-if")?.value[0] === 'false';
                let _key = '';
                let cName = item.attr.find(c => c['key'] == "r-name")?.value[0];
                if (cName) {
                    component = item.attr.find(c => c['key'] == "r-name")?.value[0];
                    cStack.push({ type: 'component', component });
                } else {
                    cStack.push({ type: 'div', component: null, remove });
                }
                if (remove) {
                    _key = undefined
                }
                else if (cName) {
                    _key = cName + '#component';
                }
                else {
                    if (map[lvl_key] == undefined) {
                        map[lvl_key] = 0;
                    } else {
                        map[lvl_key]++;
                    }
                    _key = `_${p.join("-")}#${map[lvl_key]}`;
                }

                //
                let el = new node();
                el.attr = item.attr;
                el.tag = item.tag.trim();
                el.numChild = map[lvl_key];
                el.parent = JSON.parse(JSON.stringify(p));
                el.parentNode = parentStack[parentStack.length - 1];
                el.id = _key;
                if (!item.attr.find(c => c['key'] == "r-name")?.value[0] && !remove) {
                    p.push(map[lvl_key]);
                }
                el.parentComponent = cStack.filter((c) => c.type === 'component')[cStack.filter((c) => c.type === 'component').length - 1]?.component;
                el.left = counter++;
                el.rName = item.attr.find(c => c['key'] == "r-name")?.value[0];
                res.push(el);
                el.attr.push({
                    key: 'tag',
                    value: [item.tag]
                })
                if (parentStack[parentStack.length - 1] && el.tag !== 'script') {
                    parentStack[parentStack.length - 1].childrens.push(el)
                }
                parentStack.push(el);

            },
            (item) => {
                //innertext
                if (parentStack[parentStack.length - 1]) {
                    parentStack[parentStack.length - 1].innerTEXT += item.value;
                }
            },
            (item) => {
                if (!parentStack.length) {
                    return
                }
                parentStack[parentStack.length - 1].right = counter++
                let isComponent = cStack.pop();
                //closedtag
                parentStack.pop();
                if (!isComponent.remove && isComponent.type !== 'component') {
                    p.pop();
                }
            });
        return res;


    }
}
class dom_node {
    childrens = [];
    innerTEXT = '';
    tag;
}

class _template {
    static render = (str, component) => {
        let dom = _template.html_to_dom(str);
        let html = '';
        let stack = [{ data: component.state }];
        let getVal = (key, _key) => {
            if (_key) {
                let val = stack.find((c) => c.key === _key)?.data[key]
                if (typeof val === 'function') {
                    return val(stack[stack.length - 1].data);
                }
                return val;
            }
            for (let i = stack.length - 1; i >= 0; i--) {
                let val = stack[i]?.data[key]
                if (val !== undefined) {
                    if (typeof val === 'function') {
                        return val(stack[stack.length - 1].data);
                    }
                    return val;
                }
            }
        }
        let sumHtml = (node, key = null, i = null, value, _for = false) => {
            node.tag = node.tag.trim();
            let for_key = ''
            let type_for = node?.attr?.find((c) => c['key'] === 'r-for')?.value[0];
            let type_if = node?.attr?.find((c) => c['key'] === 'r-if')?.value[0];
            let bind = node?.attr?.find((c) => c['key'] === 'r-bind')?.value[0];
            let r_click = node?.attr?.find((c) => c['key'] === 'r-click')?.value[0];
            let r_mouse = node?.attr?.find((c) => c['key'] === 'r-mouse')?.value[0];
            let r_model = node?.attr?.find((c) => c['key'] === 'r-model')?.value[0];
            let r_bind_attr = node?.attr?.filter((c) => c['key'].includes('r-bind.')).map((c) => {
                return { key: c['key'], val: c.value[0] };
            })
                ?.map(c => {
                    return {
                        attr: c.key, val: c.val
                    }
                });
            let _type_for;
            if (type_for && !key) {
                if (type_for.split("of").length > 1) {
                    for_key = type_for.split("of")[0].trim();
                    type_for = type_for.split("of")[1].trim();
                }
                if (type_for.split(".").length > 1) {
                    _type_for = type_for.split(".")[0]
                    type_for = type_for.split(".")[1]
                }
                let val = getVal(type_for, _type_for)

                if (!val?.length && components.map(item => item.name).includes(node.tag)) {
                    html += `<${node.tag} r-index="0" r-type="destroy" r-repeat="${type_for}">` + "\n"
                }
                for (let j = 0; j <= val?.length - 1; j++) {
                    value = val?.[j]
                    stack.push({ key: for_key, data: JSON.parse(JSON.stringify(value)) });
                    sumHtml(node, type_for, j, value, true);
                    stack.pop();

                }
            } else {
                let if_key
                let if_val
                if (type_if) {
                    node.attr = node?.attr?.filter((c) => c['key'] !== 'r-if');
                    if (type_if.split("")[0] === '!') {
                        if_key = type_if.split("").filter((c, i) => i !== 0).join("");
                        if_val = !Boolean(getVal(if_key))

                    } else {
                        if_key = type_if;
                        if_val = Boolean(getVal(if_key))
                    }
                }
                let attr;
                let _attr = [];
                if (r_bind_attr.length >= 1) {
                    _attr = r_bind_attr.map((c) => {
                        let _ = c.val.split(".");
                        let _key
                        if (_.length > 1) {
                            _key = _[0];
                            _ = _[1]
                        } else {
                            _ = c.val;
                        }
                        return { attr: c.attr.split(".")[1], val: getVal(_, _key) }
                    })
                }
                let bind_key;
                if (bind?.includes(".")) {
                    bind_key = bind.split(".")[0];
                    bind = bind.split(".")[1];
                }
                if (r_click) {
                    if (r_click.includes(".")) {
                        r_click = ` onclick="runEvent('${component.name}', '${r_click.split(".")[0]}', '${getVal(r_click.split(".")[1])}') "`
                    } else {
                        r_click = ` onclick="runEvent('${component.name}', '${r_click}') "`
                    }
                }
                if (r_mouse) {
                    if (r_mouse.includes(".")) {
                        r_mouse = ` onmousemove="runEvent('${component.name}', '${r_mouse.split(".")[0]}', '${getVal(r_mouse.split(".")[1])}') "`
                    } else {
                        r_mouse = ` onmousemove="runEvent('${component.name}', '${r_mouse}') "`
                    }
                }
                if (r_model) {
                    r_model = ` onchange="model('${component.name}', {event: event, key: '${r_model}'})"`
                }
                html += '<' + node.tag + ((node.attr.length > 1) ? ' ' : '') + `${node.attr.reduce((acc, item, i) => acc + ((item.key !== 'tag') ? `${item.key}="${item.value.join(" ")}"${((node.attr.length - 1 != i + 1) ? ' ' : '')}` : ''), '')}` + ((type_if) ? ` r-key="${if_key}" r-if="${if_val}" ` : '') + ((key) ? ` r-repeat="${key}" r-index="${i}"` : '') +
                    ((attr) ? `${attr}="${getVal(bind)}"` : '') +
                    ((_attr.length) ? _attr.map((c) => {
                        if (c?.attr) {
                            return ` ${c.attr}="${c.val}" `
                        } else {
                            bind = c.val;
                        }
                    }).filter((c) => c).join(" ") : '') +
                    ((r_click) ? r_click : '') +
                    ((r_mouse) ? r_mouse : '') + ">"
                html += "\n"
                html += node.innerTEXT ?? '';
                html += "\n"
                if (bind && !attr) {
                    html += getVal(bind, bind_key);
                    html += "\n"
                }
                node.childrens.forEach((node) => {
                    sumHtml(node, null, null, value);
                });
                if (!components.map(item => item.name).includes(node.tag)) {
                    html += '</' + node.tag + '>';
                    html += "\n"
                }
            }
        }
        sumHtml(dom[0], null, null, component.state);
        return html;
    }
    static html_to_dom = (str) => {
        var utils = {
            noEndTag(tag) {
                let noEndTags = [
                    'noscript',
                    'link',
                    'base',
                    'meta',
                    'input',
                    'svg',
                    'path',
                    'img',
                    'br',
                    'area',
                    'base',
                    'br',
                    'col',
                    'embed',
                    'hr',
                    'img',
                    'input',
                    'keygen',
                    'link',
                    'meta',
                    'param',
                    'source',
                    'track',
                    'wbr'
                ];
                return noEndTags.includes(tag);
            }
        };

        let res = [];
        let parentStack = [];
        superxmlparser74.parse(str,
            (item) => {
                //opentag
                if (item.tag === 'p' && parentStack[parentStack.length - 1]?.tag === 'p') {
                    parentStack.pop();
                }
                //
                let el = new dom_node();
                el.attr = item.attr;
                el.tag = item.tag;
                res.push(el);
                el.attr.push({
                    key: 'tag',
                    value: [item.tag]
                })
                if (parentStack[parentStack.length - 1] && el.tag !== 'script') {
                    parentStack[parentStack.length - 1].childrens.push(el)
                }
                if (!utils.noEndTag(el.tag)) {
                    parentStack.push(el);
                }
            },
            (item) => {
                //innertext
                if (parentStack[parentStack.length - 1]) {
                    parentStack[parentStack.length - 1].innerTEXT += item.value;
                }
            },
            (item) => {
                //closedtag
                parentStack.pop();
            });

        return res;
    }
}



(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.page = factory());
}(this, (function () {
    'use strict';

    var isarray = Array.isArray || function (arr) {
        return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
        // Match escaped characters that would otherwise appear in future matches.
        // This allows the user to escape special characters that won't transform.
        '(\\\\.)',
        // Match Express-style parameters and un-named parameters with a prefix
        // and optional suffixes. Matches appear as:
        //
        // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
        // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
        // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
        '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse(str) {
        var tokens = [];
        var key = 0;
        var index = 0;
        var path = '';
        var res;

        while ((res = PATH_REGEXP.exec(str)) != null) {
            var m = res[0];
            var escaped = res[1];
            var offset = res.index;
            path += str.slice(index, offset);
            index = offset + m.length;

            // Ignore already escaped sequences.
            if (escaped) {
                path += escaped[1];
                continue
            }

            // Push the current path onto the tokens.
            if (path) {
                tokens.push(path);
                path = '';
            }

            var prefix = res[2];
            var name = res[3];
            var capture = res[4];
            var group = res[5];
            var suffix = res[6];
            var asterisk = res[7];

            var repeat = suffix === '+' || suffix === '*';
            var optional = suffix === '?' || suffix === '*';
            var delimiter = prefix || '/';
            var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

            tokens.push({
                name: name || key++,
                prefix: prefix || '',
                delimiter: delimiter,
                optional: optional,
                repeat: repeat,
                pattern: escapeGroup(pattern)
            });
        }

        // Match any characters still remaining.
        if (index < str.length) {
            path += str.substr(index);
        }

        // If the path exists, push it onto the end.
        if (path) {
            tokens.push(path);
        }

        return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile(str) {
        return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction(tokens) {
        // Compile all the tokens into regexps.
        var matches = new Array(tokens.length);

        // Compile all the patterns before compilation.
        for (var i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] === 'object') {
                matches[i] = new RegExp('^' + tokens[i].pattern + '$');
            }
        }

        return function (obj) {
            var path = '';
            var data = obj || {};

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];

                if (typeof token === 'string') {
                    path += token;

                    continue
                }

                var value = data[token.name];
                var segment;

                if (value == null) {
                    if (token.optional) {
                        continue
                    } else {
                        throw new TypeError('Expected "' + token.name + '" to be defined')
                    }
                }

                if (isarray(value)) {
                    if (!token.repeat) {
                        throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
                    }

                    if (value.length === 0) {
                        if (token.optional) {
                            continue
                        } else {
                            throw new TypeError('Expected "' + token.name + '" to not be empty')
                        }
                    }

                    for (var j = 0; j < value.length; j++) {
                        segment = encodeURIComponent(value[j]);

                        if (!matches[i].test(segment)) {
                            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
                        }

                        path += (j === 0 ? token.prefix : token.delimiter) + segment;
                    }

                    continue
                }

                segment = encodeURIComponent(value);

                if (!matches[i].test(segment)) {
                    throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
                }

                path += token.prefix + segment;
            }

            return path
        }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup(group) {
        return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys(re, keys) {
        re.keys = keys;
        return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags(options) {
        return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp(path, keys) {
        // Use a negative lookahead to match only capturing groups.
        var groups = path.source.match(/\((?!\?)/g);

        if (groups) {
            for (var i = 0; i < groups.length; i++) {
                keys.push({
                    name: i,
                    prefix: null,
                    delimiter: null,
                    optional: false,
                    repeat: false,
                    pattern: null
                });
            }
        }

        return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp(path, keys, options) {
        var parts = [];

        for (var i = 0; i < path.length; i++) {
            parts.push(pathToRegexp(path[i], keys, options).source);
        }

        var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

        return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp(path, keys, options) {
        var tokens = parse(path);
        var re = tokensToRegExp(tokens, options);

        // Attach keys back to the regexp.
        for (var i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] !== 'string') {
                keys.push(tokens[i]);
            }
        }

        return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp(tokens, options) {
        options = options || {};

        var strict = options.strict;
        var end = options.end !== false;
        var route = '';
        var lastToken = tokens[tokens.length - 1];
        var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

        // Iterate over the tokens and create our regexp string.
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            if (typeof token === 'string') {
                route += escapeString(token);
            } else {
                var prefix = escapeString(token.prefix);
                var capture = token.pattern;

                if (token.repeat) {
                    capture += '(?:' + prefix + capture + ')*';
                }

                if (token.optional) {
                    if (prefix) {
                        capture = '(?:' + prefix + '(' + capture + '))?';
                    } else {
                        capture = '(' + capture + ')?';
                    }
                } else {
                    capture = prefix + '(' + capture + ')';
                }

                route += capture;
            }
        }

        // In non-strict mode we allow a slash at the end of match. If the path to
        // match already ends with a slash, we remove it for consistency. The slash
        // is valid at the end of a path match, not in the middle. This is important
        // in non-ending mode, where "/test/" shouldn't match "/test//route".
        if (!strict) {
            route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
        }

        if (end) {
            route += '$';
        } else {
            // In non-ending mode, we need the capturing groups to match as much as
            // possible by using a positive lookahead to the end or next path segment.
            route += strict && endsWithSlash ? '' : '(?=\\/|$)';
        }

        return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp(path, keys, options) {
        keys = keys || [];

        if (!isarray(keys)) {
            options = keys;
            keys = [];
        } else if (!options) {
            options = {};
        }

        if (path instanceof RegExp) {
            return regexpToRegexp(path, keys, options)
        }

        if (isarray(path)) {
            return arrayToRegexp(path, keys, options)
        }

        return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */



    /**
     * Short-cuts for global-object checks
     */

    var hasDocument = ('undefined' !== typeof document);
    var hasWindow = ('undefined' !== typeof window);
    var hasHistory = ('undefined' !== typeof history);
    var hasProcess = typeof process !== 'undefined';

    /**
     * Detect click event
     */
    var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

    /**
     * To work properly with the URL
     * history.location generated polyfill in https://github.com/devote/HTML5-History-API
     */

    var isLocation = hasWindow && !!(window.history.location || window.location);

    /**
     * The page instance
     * @api private
     */
    function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
    }

    /**
     * Configure the instance of page. This can be called multiple times.
     *
     * @param {Object} options
     * @api public
     */

    Page.prototype.configure = function (options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if (this._popstate) {
            _window.addEventListener('popstate', this._onpopstate, false);
        } else if (hasWindow) {
            _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
            _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if (hasDocument) {
            _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if (this._hashbang && hasWindow && !hasHistory) {
            _window.addEventListener('hashchange', this._onpopstate, false);
        } else if (hasWindow) {
            _window.removeEventListener('hashchange', this._onpopstate, false);
        }
    };

    /**
     * Get or set basepath to `path`.
     *
     * @param {string} path
     * @api public
     */

    Page.prototype.base = function (path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
    };

    /**
     * Gets the `base`, which depends on whether we are using History or
     * hashbang routing.
  
     * @api private
     */
    Page.prototype._getBase = function () {
        var base = this._base;
        if (!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if (hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
            base = loc.pathname;
        }

        return base;
    };

    /**
     * Get or set strict path matching to `enable`
     *
     * @param {boolean} enable
     * @api public
     */

    Page.prototype.strict = function (enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
    };


    /**
     * Bind with the given `options`.
     *
     * Options:
     *
     *    - `click` bind to click events [true]
     *    - `popstate` bind to popstate [true]
     *    - `dispatch` perform initial dispatch [true]
     *
     * @param {Object} options
     * @api public
     */

    Page.prototype.start = function (options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if (isLocation) {
            var window = this._window;
            var loc = window.location;

            if (this._hashbang && ~loc.hash.indexOf('#!')) {
                url = loc.hash.substr(2) + loc.search;
            } else if (this._hashbang) {
                url = loc.search + loc.hash;
            } else {
                url = loc.pathname + loc.search + loc.hash;
            }
        }

        this.replace(url, null, true, opts.dispatch);
    };

    /**
     * Unbind click and popstate event handlers.
     *
     * @api public
     */

    Page.prototype.stop = function () {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
    };

    /**
     * Show `path` with optional `state` object.
     *
     * @param {string} path
     * @param {Object=} state
     * @param {boolean=} dispatch
     * @param {boolean=} push
     * @return {!Context}
     * @api public
     */

    Page.prototype.show = function (path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
            prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
    };

    /**
     * Goes back in the history
     * Back should always let the current route push state and then go back.
     *
     * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
     * @param {Object=} state
     * @api public
     */

    Page.prototype.back = function (path, state) {
        var page = this;
        if (this.len > 0) {
            var window = this._window;
            // this may need more testing to see if all browsers
            // wait for the next tick to go back in history
            hasHistory && window.history.back();
            this.len--;
        } else if (path) {
            setTimeout(function () {
                page.show(path, state);
            });
        } else {
            setTimeout(function () {
                page.show(page._getBase(), state);
            });
        }
    };

    /**
     * Register route to redirect from one path to other
     * or just redirect to another route
     *
     * @param {string} from - if param 'to' is undefined redirects to 'from'
     * @param {string=} to
     * @api public
     */
    Page.prototype.redirect = function (from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
            page.call(this, from, function (e) {
                setTimeout(function () {
                    inst.replace(/** @type {!string} */(to));
                }, 0);
            });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
            setTimeout(function () {
                inst.replace(from);
            }, 0);
        }
    };

    /**
     * Replace `path` with optional `state` object.
     *
     * @param {string} path
     * @param {Object=} state
     * @param {boolean=} init
     * @param {boolean=} dispatch
     * @return {!Context}
     * @api public
     */


    Page.prototype.replace = function (path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
            prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
    };

    /**
     * Dispatch the given `ctx`.
     *
     * @param {Context} ctx
     * @api private
     */

    Page.prototype.dispatch = function (ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
            var fn = page.exits[j++];
            if (!fn) return nextEnter();
            fn(prev, nextExit);
        }

        function nextEnter() {
            var fn = page.callbacks[i++];

            if (ctx.path !== page.current) {
                ctx.handled = false;
                return;
            }
            if (!fn) return unhandled.call(page, ctx);
            fn(ctx, nextEnter);
        }

        if (prev) {
            nextExit();
        } else {
            nextEnter();
        }
    };

    /**
     * Register an exit route on `path` with
     * callback `fn()`, which will be called
     * on the previous context when a new
     * page is visited.
     */
    Page.prototype.exit = function (path, fn) {
        if (typeof path === 'function') {
            return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
            this.exits.push(route.middleware(arguments[i]));
        }
    };

    /**
     * Handle "click" events.
     */

    /* jshint +W054 */
    Page.prototype.clickHandler = function (e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if (eventPath) {
            for (var i = 0; i < eventPath.length; i++) {
                if (!eventPath[i].nodeName) continue;
                if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
                if (!eventPath[i].href) continue;

                el = eventPath[i];
                break;
            }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if (!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
            path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
            path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
            return;
        }

        e.preventDefault();
        this.show(orig);
    };

    /**
     * Handle "populate" events.
     * @api private
     */

    Page.prototype._onpopstate = (function () {
        var loaded = false;
        if (!hasWindow) {
            return function () { };
        }
        if (hasDocument && document.readyState === 'complete') {
            loaded = true;
        } else {
            window.addEventListener('load', function () {
                setTimeout(function () {
                    loaded = true;
                }, 0);
            });
        }
        return function onpopstate(e) {
            if (!loaded) return;
            var page = this;
            if (e.state) {
                var path = e.state.path;
                page.replace(path, e.state);
            } else if (isLocation) {
                var loc = page._window.location;
                page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
            }
        };
    })();

    /**
     * Event button.
     */
    Page.prototype._which = function (e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
    };

    /**
     * Convert to a URL object
     * @api private
     */
    Page.prototype._toURL = function (href) {
        var window = this._window;
        if (typeof URL === 'function' && isLocation) {
            return new URL(href, window.location.toString());
        } else if (hasDocument) {
            var anc = window.document.createElement('a');
            anc.href = href;
            return anc;
        }
    };

    /**
     * Check if `href` is the same origin.
     * @param {string} href
     * @api public
     */
    Page.prototype.sameOrigin = function (href) {
        if (!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
            loc.hostname === url.hostname &&
            (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
    };

    /**
     * @api private
     */
    Page.prototype._samePath = function (url) {
        if (!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
            url.search === loc.search;
    };

    /**
     * Remove URL encoding from the given `str`.
     * Accommodates whitespace in both x-www-form-urlencoded
     * and regular percent-encoded form.
     *
     * @param {string} val - URL component to decode
     * @api private
     */
    Page.prototype._decodeURLEncodedURIComponent = function (val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
    };

    /**
     * Create a new `page` instance and function
     */
    function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
            return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
            get: function () {
                return pageInstance.len;
            },
            set: function (val) {
                pageInstance.len = val;
            }
        });

        Object.defineProperty(pageFn, 'current', {
            get: function () {
                return pageInstance.current;
            },
            set: function (val) {
                pageInstance.current = val;
            }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
    }

    /**
     * Register `path` with callback `fn()`,
     * or route `path`, or redirection,
     * or `page.start()`.
     *
     *   page(fn);
     *   page('*', fn);
     *   page('/user/:id', load, user);
     *   page('/user/' + user.id, { some: 'thing' });
     *   page('/user/' + user.id);
     *   page('/from', '/to')
     *   page();
     *
     * @param {string|!Function|!Object} path
     * @param {Function=} fn
     * @api public
     */

    function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
            return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
            var route = new Route(/** @type {string} */(path), null, this);
            for (var i = 1; i < arguments.length; ++i) {
                this.callbacks.push(route.middleware(arguments[i]));
            }
            // show <path> with [state]
        } else if ('string' === typeof path) {
            this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
            // start [options]
        } else {
            this.start(path);
        }
    }

    /**
     * Unhandled `ctx`. When it's not the initial
     * popstate then redirect. If you wish to handle
     * 404s on your own use `page('*', callback)`.
     *
     * @param {Context} ctx
     * @api private
     */
    function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
            current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
            current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
    }

    /**
     * Escapes RegExp characters in the given string.
     *
     * @param {string} s
     * @api private
     */
    function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
    }

    /**
     * Initialize a new "request" `Context`
     * with the given `path` and optional initial `state`.
     *
     * @constructor
     * @param {string} path
     * @param {Object=} state
     * @api public
     */

    function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
            if (!~this.path.indexOf('#')) return;
            var parts = this.path.split('#');
            this.path = this.pathname = parts[0];
            this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
            this.querystring = this.querystring.split('#')[0];
        }
    }

    /**
     * Push state.
     *
     * @api private
     */

    Context.prototype.pushState = function () {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
                hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
    };

    /**
     * Save the context state.
     *
     * @api public
     */

    Context.prototype.save = function () {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
                page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
    };

    /**
     * Initialize `Route` with the given HTTP `path`,
     * and an array of `callbacks` and `options`.
     *
     * Options:
     *
     *   - `sensitive`    enable case-sensitive routes
     *   - `strict`       enable strict matching for trailing slashes
     *
     * @constructor
     * @param {string} path
     * @param {Object=} options
     * @api private
     */

    function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
    }

    /**
     * Return route middleware with
     * the given callback `fn()`.
     *
     * @param {Function} fn
     * @return {Function}
     * @api public
     */

    Route.prototype.middleware = function (fn) {
        var self = this;
        return function (ctx, next) {
            if (self.match(ctx.path, ctx.params)) {
                ctx.routePath = self.path;
                return fn(ctx, next);
            }
            next();
        };
    };

    /**
     * Check if this route matches `path`, if so
     * populate `params`.
     *
     * @param {string} path
     * @param {Object} params
     * @return {boolean}
     * @api private
     */

    Route.prototype.match = function (path, params) {
        var keys = this.keys,
            qsIndex = path.indexOf('?'),
            pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
            m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
            var key = keys[i - 1];
            var val = this.page._decodeURLEncodedURIComponent(m[i]);
            if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
                params[key.name] = val;
            }
        }

        return true;
    };


    /**
     * Module exports.
     */

    var globalPage = createPage();
    var page_js = globalPage;
    var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

})));

var domBuilder = new BuilderDOM();

var currentComponents = [];
var components = {};

class component {
    name = '';
    index = null;
    propKey = null;
    constructor(_name) {
        this.name = _name;
    }
    get _body() {
        if (!this.propKey || getProps(this.parent, this.propKey)?.length !== 0) {
            return this.body();
        }
        return ``;
    }
    body() {

    }
    init() {

    }
    destroy() {

    }
    getProps = (nameprop) => {
        if (this.index === undefined) {
            return getProps(this.parent, nameprop);
        }
        return getProps(this.parent, this.propKey, this.index);
    };
}

var _currentDom = '';
page.configure({ window: window })

class render {
    init = true;
    vdom = [];
    prevVdom = [];
    hiddenEls = [];
    prevComponents = [];

    constructor(_components) {
        components = _components;
        if (_currentDom == '') {
            _currentDom = document.querySelector('.main').innerHTML.trim().split("\n");
        }
    }

    renderDom() {
        var currentDom = '';
        let counter = 0;
        var hierarchyStack = [];
        let map = [];
        let prevC = {};
        let destroy = [];
        let destroys = [];
        let lifeCycle = () => {
            let dfs = (node) => {
                if (node?.attr?.find((c) => c['key'] === 'r-if')?.value[0] == 'true') {
                    let key = node?.attr?.find((c) => c['key'] === 'r-key')?.value[0]
                    let prevValue =
                        this.prevComponents.find((c) => c.name == node.parentComponent)?.component?.state?.[key];
                    let currValue =
                        currentComponents.find((c) => c.name == node.parentComponent)?.component?.state?.[key];

                    if (prevValue !== undefined && currValue != prevValue) {
                        destroys.push(...this.prevVdom.filter((item) => node.left < item.left && node.right > item.right)
                            ?.filter((c) => c?.id?.includes("component"))
                            ?.map(c => c.attr?.find((c) => c['key'] === 'r-name')?.value[0])
                        )
                    }
                }
                node?.childrens?.forEach((node) => {
                    dfs(node);
                });
            }
            dfs(this.prevVdom[0]);
        }
        if (this.prevVdom) {
            lifeCycle();
        }
        _currentDom.forEach((tag) => {
            //deep
            let deep = (tag) => {
                let tagData = this.utils.parseTag(tag);
                const tagName = tagData?.tag?.trim();
                const rRepeatIndex = tagData?.attr?.find((c) => c.key == 'r-index')?.value[0];
                const rRepeatKey = tagData?.attr?.find((c) => c.key == 'r-repeat')?.value[0];
                const rIf = tagData?.attr?.find((c) => c.key == 'r-if')?.value[0];
                const rType = tagData?.attr?.find((c) => c.key == 'r-type')?.value[0];

                if (!this.utils.isComponent(tagName)) {
                    currentDom += tag + "\n";
                } else {
                    let _key = hierarchyStack.join(".") + `#${tagName}`;
                    if (map[_key] === undefined) {
                        map[_key] = 0;
                    }
                    map[_key]++;
                    let currentName = `${_key}-${map[_key]}`;
                    if (destroys.includes(currentName)) {
                        currentComponents.filter((c) => {
                            return c.hierarchy?.split(".")?.includes(currentName);
                        }).forEach((c) => {
                            c.component.destroy();
                            currentComponents = currentComponents.filter((d) => d.name !== c.name);
                        });
                        return;
                    }
                    if (rRepeatKey) {
                        let prevC = currentComponents.find((c) => c.name == hierarchyStack[hierarchyStack.length - 1]).component

                        let prevArr =
                            this.prevComponents.find((c) => c.name == prevC.name)?.component.state[rRepeatKey];
                        let currArr = prevC?.state?.[rRepeatKey];
                        if (prevArr?.length < currArr?.length) {
                            prevC.state = this.utils.setIndexes(prevC.state);
                        }
                    }
                    if (rRepeatKey &&
                        this.prevComponents.find((c) => c.name == currentName)) {
                        let prevC = currentComponents.find((c) => c.name == hierarchyStack[hierarchyStack.length - 1]).component
                        if (!destroy.includes(prevC.name)) {
                            destroy.push(prevC.name)

                            let prevArr =
                                this.prevComponents.find((c) => c.name == prevC.name).component.state[rRepeatKey];
                            let currArr = prevC.state[rRepeatKey];

                            var diffIndexes = prevArr.map(c => c.index).filter((i) => {
                                return !currArr.map(c => c.index).includes(i);
                            });
                            let j = 0;
                            for (let i = 0; i <= prevArr.length - 1; i++) {
                                j++;
                                let name = `${_key}-${(map[_key]) + (i)}`
                                let cc = currentComponents.find(c => c.name == name);
                                if (diffIndexes.includes(i)) {

                                    prevC.state = this.utils.setIndexes(prevC.state);
                                    j--;
                                    currentComponents.filter((c) => {
                                        return c.hierarchy?.split(".")?.includes(cc.name);
                                    }).forEach((c) => {

                                        c.component.destroy();
                                        currentComponents = currentComponents.filter((d) => d.name !== c.name);
                                    });
                                } else {
                                    let p = cc.name;
                                    let _name = cc.name.split("-")
                                    _name.pop();
                                    _name = _name.join("-")
                                    cc.name = _name + "-" + j;
                                    cc.component.index = j - 1;
                                    cc.component.name = cc.name;
                                    for (let i = 0; i <= currentComponents.length - 1; i++) {
                                        currentComponents[i].hierarchy = currentComponents[i].hierarchy?.split(p).join(cc.name);
                                    }
                                }

                            }

                        }
                    }
                    let component = currentComponents.find(item => item.name === currentName);
                    hierarchyStack.push(currentName);
                    if (rType == "destroy") {
                        return;
                    }
                    if (!component) {
                        let currentComponent = components.find((item) => item.name === tagName).component;
                        component = new currentComponent(currentName);
                        currentComponents.push({
                            name: currentName,
                            component: component,
                            hierarchy: hierarchyStack.join('.')
                        });
                        component.name = currentName;
                        component.index = rRepeatIndex;
                        component.propKey = rRepeatKey;
                        component.parent = hierarchyStack[hierarchyStack.length - 2];
                        component.init();
                        component.state = this.utils.setIndexes(component.state);
                    } else {
                        component = component.component;
                    }
                    let currentComponentDom = _template.render(component._body, component);
                    currentDom += `<div r-name="${currentName}">`
                    currentComponentDom.split("\n").forEach((tag) => {
                        deep(tag);
                    });
                    currentDom += `</div r-name="${currentName}">`
                    hierarchyStack.pop(currentName);
                }
            }
            deep(tag);


            //  
        });
        let html = '';
        let sumHtml = (node, init = false) => {
            if (!node || node?.attr?.find((c) => c['key'] === 'r-if')?.value[0] == 'false') {
                return;
            }
            if (node?.attr?.find((c) => c['key'] === 'r-name')?.value[0]) {
                init = true;
            }
            if (!init) {
                html += '<' + node.tag + ((node.attr.length > 1) ? ' ' : '') + `${node.attr.reduce((acc, item, i) => acc + ((item.key !== 'tag') ? `${item.key}="${item.value.join(" ")}"${((node.attr.length - 1 != i + 1) ? ' ' : '')}` : ''), '')}` + ">"
                html += node.innerTEXT;
            }
            node.childrens.forEach((node) => {
                sumHtml(node);
            });
            if (!init) {
                html += '</' + node.tag + '>';
            }
        }
        //todo dom
        if (!this.init) {
            let getDomEl = (virtualDomStack) => {
                let currentDocumentDom = document.querySelector('.main');
                for (let i = 1; i <= virtualDomStack.length - 1; i++) {
                    let numChild;
                    if (Number(virtualDomStack[i]) === virtualDomStack[i]) {
                        numChild = virtualDomStack[i];
                    } else {
                        numChild = this.vdom.find(el => el.id == virtualDomStack[i]).numChild;
                    }
                    if (currentDocumentDom.children[numChild]) {
                        currentDocumentDom = currentDocumentDom.children[numChild];
                    }
                }
                return currentDocumentDom;
            }
            var stackUpdateDom = [];
            this.vdom = domBuilder.build(currentDom);

            let deepReplace = (_id) => {
                if (!_id) {
                    return;
                }
                let elVdom = this.vdom.find((el) => el.id == _id)
                let prevElVdom = this.prevVdom.find((el) => el.id == _id)

                let c1 = elVdom?.childrens?.length;
                let c2 = prevElVdom?.childrens?.length;

                let c3 = (c1 > c2) ? c1 : c2;
                for (let i = 0; i <= c3 - 1; i++) {
                    let cc1 = this.vdom.find((el) => el.id == elVdom?.childrens[i]?.id);
                    let cc2 = this.prevVdom.find((el) => el.id == prevElVdom?.childrens[i]?.id);
                    let q1 = { ...cc1, childrens: "", parentComponent: "", parentNode: "", left: '', right: '' };
                    let q2 = { ...cc2, childrens: "", parentComponent: "", parentNode: "", left: '', right: '' };
                    if (JSON.stringify(q1) !== JSON.stringify(q2)) {
                        if (prevElVdom.id.includes('component')) {
                            prevElVdom = prevElVdom.parentNode;
                            elVdom = elVdom.parentNode;
                        }
                        stackUpdateDom.push({ el: elVdom, prev: prevElVdom, type: "create" })
                        return;
                    } {
                        deepReplace(cc1.id);
                    }
                }

            }
            deepReplace(this.vdom[0].id);
            stackUpdateDom.forEach((itemUpdate) => {
                let domEl = getDomEl([...itemUpdate.prev.parent, itemUpdate.prev.id]);
                html = '';
                switch (itemUpdate.type) {
                    case "delete":
                        //todo
                        break;
                    case "create":
                        sumHtml(itemUpdate.el, true);
                        domEl.innerHTML = html;
                        break;
                    case "text":
                        //todo
                        break;
                }
            });

            this.prevVdom = this.vdom;
            this.prevComponents = JSON.parse(JSON.stringify(currentComponents))
        } else {
            this.vdom = domBuilder.build(currentDom);
            sumHtml(this.vdom[0], true);
            document.querySelector('.main').innerHTML = html;
            this.init = false;
            this.prevVdom = this.vdom;
        }
        ////////////
    }

    utils = {
        isComponent(tag) {
            return components.map(item => item.name).includes(tag);
        },
        parseTag(str) {
            let data = {};
            superxmlparser74.parse(str, (item) => {
                data = item;
            }, () => { }, () => { })
            return data;
        },
        setIndexes(arr) {
            Object.keys(arr).forEach((key) => {
                //todo 
                if (Array.isArray(arr[key])) {
                    arr[key] = arr[key].map((value, index) => {
                        return {
                            ...value, index: index,
                        }
                    });
                }
            });
            return arr;
        }
    };
}

function runEvent(name, nameEvent, arg) {
    currentComponents.find((item) => {
        return item.name === name;
    }).component[nameEvent](arg);
    Render.renderDom();
}

function runParentEvent(name, nameEvent, arg) {
    let nameparent = '';
    currentComponents.forEach((item) => {
        item = item.hierarchy.split('.');
        if (item[item.length - 1] === name) {
            nameparent = item[item.length - 2];
        }
    });
    runEvent(nameparent, nameEvent, arg);
}
function getProps(name, nameprop, i = undefined, asd = false) {
    let c = currentComponents.find((item) => {
        item = item.hierarchy.split('.');
        return (item[item.length - 1] === name);
    });
    if (i !== undefined) {
        return c?.component.state[nameprop]?.[i];
    }
    return c?.component?.state?.[nameprop]
}

function model(name, { event, key }) {
    const value = event.target.value;
    currentComponents.find((item) => {
        item = item.hierarchy.split('.');
        return item[item.length - 1] === name;
    }).component.state[key] = value;
    Render.renderDom();
}