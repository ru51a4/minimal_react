
var domBuilder = new BuilderDOM();

var currentComponents = [];
var components = {};

class component {
    name = '';
    index = null;
    constructor(_name) {
        this.name = _name;
    }
    init = () => {

    }
    destroy = () => {

    }
    getProps = (nameprop) => {
        if (this.index === undefined) {
            return getProps(this.name, nameprop);
        }
        return getProps(this.name, nameprop, this.index);
    };
}


class render {
    currentDom;
    init = true;
    vdom = [];
    prevVdom = [];
    hiddenEls = [];

    constructor(_components) {
        components = _components;
        this.currentDom = document.querySelector('.main').innerHTML.trim().split("\n");
    }

    renderDom() {
        var currentDom = '';
        let counter = 0;

        this.currentDom.forEach((tag) => {
            //deep
            var hierarchyStack = [];
            let deep = (tag) => {
                let tagData = this.utils.parseTag(tag);
                const tagName = tagData?.tag?.trim();
                const rIForIndex = tagData?.attr?.find((c) => c.key == 'r-index')?.value[0];
                if (!this.utils.isComponent(tagName)) {
                    currentDom += tag + "\n";
                } else {
                    const currentName = `${tagName}-${counter++}`;
                    let component = currentComponents.find(item => item.name === currentName);
                    hierarchyStack.push(currentName);
                    if (!component) {
                        let currentComponent = components.find((item) => item.name === tagName).component;
                        component = new currentComponent(currentName);
                        currentComponents.push({
                            name: currentName,
                            component: component,
                            hierarchy: hierarchyStack.join('.')
                        });
                        component.index = rIForIndex;
                        component.init();
                    } else {
                        component = component.component;
                    }
                    let currentComponentDom = component.body();
                    currentComponentDom.split("\n").forEach((tag) => {
                        deep(tag);
                    });
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
                    let q1 = { ...cc1, childrens: "" };
                    let q2 = { ...cc2, childrens: "" };
                    if (JSON.stringify(q1) !== JSON.stringify(q2)) {
                        stackUpdateDom.push({ prev: prevElVdom, el: elVdom, type: "create" })
                        return;
                    } {
                        deepReplace(cc1.id);
                    }
                }

            }

            deepReplace(this.vdom[0].id);
            console.log(this.vdom);
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
function getProps(name, nameprop, i = null) {
    let nameparent = '';
    currentComponents.forEach((item) => {
        item = item.hierarchy.split('.');
        if (item[item.length - 1] === name) {
            nameparent = item[item.length - 2];
        }
    });
    let c = currentComponents.find((item) => {
        item = item.hierarchy.split('.');
        return (item[item.length - 1] === nameparent);
    });
    if (i) {
        return c.component.state[nameprop][i];
    }
    return c.component.state[nameprop]
}

function model(name, { event, key }) {
    const value = event.target.value;
    currentComponents.find((item) => {
        item = item.hierarchy.split('.');
        return item[item.length - 1] === name;
    }).component.state[key] = value;
    Render.renderDom();
}