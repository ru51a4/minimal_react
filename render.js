
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
            function deep(tag) {
                const tagName = this.utils.getTag(tag);
                const rIfIndex = this.utils.getRIndex(tag);
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
                        component.index = rIfIndex;
                        component.init();
                    } else {
                        component = component.component;
                    }
                    let currentComponentDom = component.body();
                    currentComponentDom.split("\n").forEach((tag) => {
                        deep.bind(this, tag)();
                    });
                    hierarchyStack.pop(currentName);
                }
            }

            deep.bind(this, tag)();

            //
        });
        let html = '';
        let htmllvl = 0;
        function sumHtml(index, init = false, create = false, sss = false) {
            let ff = false;
            if (sss) {
                ff = true;
                htmllvl = 0;
            } else {
                htmllvl++;
            }
            const node = this.vdom.find(el => el.id === index);
            if (!node || node?.attr.find((c) => c['key'] === 'r-if')?.value[0] == 'false') {
                return;
            }
            if (htmllvl !== 0) {
                html += '<' + node.tag + ((node.attr.length > 1) ? ' ' : '') + `${node.attr.reduce((acc, item, i) => acc + ((item.key !== 'tag') ? `${item.key}="${item.value.join(" ")}"${((node.attr.length - 1 != i + 1) ? ' ' : '')}` : ''), '')}` + ">"
                html += node.innerTEXT;
            }
            node.childrens.forEach((childId) => {
                sumHtml.bind(this, childId, true, true)();
            });
            if (!ff) {
                html += '</' + node.tag + '>';
            }
        }
        //todo dom
        if (!this.init) {
            function getDomEl(virtualDomStack, ff) {
                let currentDocumentDom = document.querySelector('.main');
                for (let i = 1; i <= virtualDomStack.length - 1; i++) {

                    let numChild = this.vdom.find(el => el.id == virtualDomStack[i]).numChild;
                    if (currentDocumentDom.children[numChild]) {

                        currentDocumentDom = currentDocumentDom.children[numChild];
                    }
                }
                return currentDocumentDom;
            }
            var stackUpdateDom = [];
            this.vdom = domBuilder.build(currentDom);
            let kek = false;


            function deepReplace(index) {
                let elVdom = this.vdom[index];
                let prevElVdom = this.prevVdom[index];

                let q1 = { ...elVdom, childrens: "" };
                let q2 = { ...prevElVdom, childrens: "" };
                if (JSON.stringify(q1) !== JSON.stringify(q2)) {
                    let qq = this.prevVdom.find((el) => el.id == q1.parent[q1.parent.length - 1])
                    let qq2 = this.prevVdom.find((el) => el.id == q2.parent[q2.parent.length - 1])
                    stackUpdateDom.push({ prev: qq2, el: qq, type: "create" })
                    return;
                }



                let c1 = elVdom.childrens.length;
                let c2 = prevElVdom.childrens.length;
                let c3 = (c1 > c2) ? c1 : c2;
                for (let i = 0; i <= c3 - 1; i++) {
                    let cc1 = this.vdom.find((el) => el.id == elVdom.childrens[i]);
                    let cc2 = this.prevVdom.find((el) => el.id == prevElVdom.childrens[i]);
                    let q1 = { ...cc1, childrens: "" };
                    let q2 = { ...cc2, childrens: "" };
                    if (JSON.stringify(q1) !== JSON.stringify(q2)) {
                        stackUpdateDom.push({ prev: prevElVdom, el: elVdom, type: "create" })
                        return;
                    } {
                        var domElIndex;
                        this.prevVdom.forEach((item, elIndex) => {
                            if (cc1.id === item.id) {
                                domElIndex = elIndex;
                            }
                        });

                        deepReplace.bind(this, domElIndex)();
                    }
                }

            }

            deepReplace.bind(this, 1)();

            stackUpdateDom.forEach((itemUpdate) => {
                let domEl = getDomEl.bind(this, [...itemUpdate.prev.parent, itemUpdate.prev.id], true)();
                html = '';
                switch (itemUpdate.type) {
                    case "delete":
                        domEl.remove();
                        break;
                    case "create":
                        sumHtml.bind(this, itemUpdate.el.id, true, true, true)();
                        domEl.innerHTML = html;
                        break;
                    case "text":
                        domEl.innerText = itemUpdate.el.innerTEXT;
                        break;
                }
            });
            this.prevVdom = JSON.parse(JSON.stringify(this.vdom));
        } else {
            this.vdom = domBuilder.build(currentDom);
            sumHtml.bind(this, 1, true, true)();
            document.querySelector('.main').innerHTML = html;
            this.init = false;
            this.prevVdom = domBuilder.build(currentDom);
        }
        ////////////
    }

    utils = {
        isComponent(tag) {
            return components.map(item => item.name).includes(tag);
        },
        getTag(str) {
            if (str.includes("r-index")) {
                return str.split("</")[0].replace("<", "").replace(">", "").trim().split(" ")[0].trim();
            }
            return str.split("</")[0].replace("<", "").replace(">", "").trim();
        },
        getRIndex(str) {
            return str.split("r-index=\"")[1]?.split("\"")[0]
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