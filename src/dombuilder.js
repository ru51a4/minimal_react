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