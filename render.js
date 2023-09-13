
var domBuilder = new BuilderDOM();

var currentComponents = [];
var components = {};

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
            let $currComponents = [];
            let $prevCurrComponents = [];
            function deep(tag) {
                const tagName = this.utils.getTag(tag);
                if (!this.utils.isComponent(tagName)) {
                    currentDom += tag + "\n";
                } else {
                    const currentName = `${tagName}-${counter++}`;
                    let component = currentComponents.find(item => item.name === currentName);
                    hierarchyStack.push(currentName);
                    $currComponents.push(currentName)
                    if (!component) {
                        let currentComponent = components.find((item) => item.name === tagName).component;
                        component = new currentComponent(currentName);
                        component.init();
                        currentComponents.push({
                            name: currentName,
                            component: component,
                            hierarchy: hierarchyStack.join('.')
                        });
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
            $prevCurrComponents.forEach(($item) => {
                if (!$currComponents.includes($item)) {
                    currentComponents.find((c) => c.name === $item).destroy();
                }
            });
            $prevCurrComponents = $currComponents;

            //
        });
        let html = '';
        let htmllvl = 0;
        function sumHtml(index, init = false, create = false, sss = false) {
            if (sss) {
                htmllvl = 0;
            } else {
                htmllvl++;
            }
            const el = this.vdom.find(el => el.id === index);
            if (el.tag.includes(`r-if="false"`)) {
                return;
            }
            if (htmllvl !== 0) {
                html += el.tag + el.innerTEXT;
            }
            el.childrens.forEach((childId) => {
                sumHtml.bind(this, childId, true, true)();
            });
            if (htmllvl !== 0) {
                html += el.closedtag;
            }
        }
        //todo dom
        if (!this.init) {
            function getDomEl(virtualDomStack, ff) {
                let currentDocumentDom = document.querySelector('.main');

                for (let i = 1; i <= virtualDomStack.length - 1; i++) {
                    let numChild = this.vdom.find(el => el.id == virtualDomStack[i]).numChild;
                    console.log({ numChild })
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

                if (!elVdom) {
                    stackUpdateDom.push({ prev: prevElVdom, el: elVdom, type: "delete" })
                    return;
                }

                let q1 = { ...elVdom, childrens: "" };
                let q2 = { ...prevElVdom, childrens: "" };
                if (JSON.stringify(q1) !== JSON.stringify(q2)) {
                    let qq = this.prevVdom.find((el) => el.id == q1.parrent[q1.parrent.length - 1])
                    let qq2 = this.prevVdom.find((el) => el.id == q2.parrent[q2.parrent.length - 1])

                    stackUpdateDom.push({ prev: qq2, el: qq, type: "create" })
                    return;
                }



                let c1 = elVdom.childrens.length;
                let c2 = prevElVdom.childrens.length;
                let c3 = (c1 > c2) ? c1 : c2;
                for (let i = 0; i <= c3 - 1; i++) {
                    let cc1 = this.vdom.find((el) => el.id == elVdom.childrens[i]);
                    let cc2 = this.prevVdom.find((el) => el.id == prevElVdom.childrens[i]);
                    if (JSON.stringify(cc1) != JSON.stringify(cc2)) {
                        let q1 = { ...cc1, childrens: "" };
                        let q2 = { ...cc2, childrens: "" };
                        console.log({ q1, q2 })
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
                        return;
                    } else {
                        var domElIndex;
                        this.prevVdom.forEach((item, elIndex) => {
                            if (cc1.id === item.id) {
                                domElIndex = elIndex;
                            }
                        });

                        deepReplace.bind(this, domElIndex)();

                    }
                }
                if (elVdom.innerTEXT.trim() !== prevElVdom.innerTEXT.trim()) {
                    stackUpdateDom.push({ prev: prevElVdom, el: elVdom, type: "text" })
                    return;
                }

            }

            deepReplace.bind(this, 1)();

            console.log({ stackUpdateDom })
            stackUpdateDom.forEach((itemUpdate) => {
                let domEl = getDomEl.bind(this, [...itemUpdate.prev.parrent, itemUpdate.prev.id], true)();
                html = '';
                console.log({ domEl });

                switch (itemUpdate.type) {
                    case "delete":
                        domEl.remove();
                        break;
                    case "create":
                        sumHtml.bind(this, itemUpdate.el.id, true, true, true)();
                        console.log({ html })
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
            return str.split("</")[0].replace("<", "").replace(">", "").trim();
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

function runParrentEvent(name, nameEvent) {
    let nameParrent = '';
    currentComponents.forEach((item) => {
        item = item.hierarchy.split('.');
        if (item[item.length - 1] === name) {
            nameParrent = item[item.length - 2];
        }
    });
    runEvent(nameParrent, nameEvent);
}

function model(name, { event, key }) {
    const value = event.target.value;
    currentComponents.find((item) => {
        item = item.hierarchy.split('.');
        return item[item.length - 1] === name;
    }).component.state[key] = value;
    Render.renderDom();
}