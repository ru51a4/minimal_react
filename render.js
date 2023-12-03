
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


class render {
    currentDom;
    init = true;
    vdom = [];
    prevVdom = [];
    hiddenEls = [];
    prevComponents = [];

    constructor(_components) {
        components = _components;
        this.currentDom = document.querySelector('.main').innerHTML.trim().split("\n");
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

                    if (currValue != prevValue) {
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
        this.currentDom.forEach((tag) => {
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
                                    currentName = currentName?.split(p).join(cc.name);
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
                        component.index = rRepeatIndex;
                        component.propKey = rRepeatKey;
                        component.parent = hierarchyStack[hierarchyStack.length - 2];
                        component.init();
                        component.state = this.utils.setIndexes(component.state);
                    } else {
                        component = component.component;
                    }
                    let currentComponentDom = component._body;
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
        item = item.hierarchy.split('.');
        return item[item.length - 1] === name;
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