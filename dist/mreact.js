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

class render {
    init = true;
    vdom = [];
    prevVdom = [];
    hiddenEls = [];
    prevComponents = [];
    _el = {};
    constructor(_el, _components) {
        components = _components;
        this._el = _el;
        _currentDom = this._el.innerHTML.trim().split("\n");
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
                let currentDocumentDom = this._el;
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
                let childs = [];
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
                        childs.push(cc1.id);
                    }
                }
                childs.forEach((id) => {
                    deepReplace(id);
                })

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
            this._el.innerHTML = html;
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