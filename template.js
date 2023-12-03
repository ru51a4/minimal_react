class r_template {
    render = (str, components) => {
        _str = '';
        let _render = (node) => {

        }
        let res = [];
        let parentStack = [];
        let counter = 0;
        let map = [];
        let p = [];
        superxmlparser74.parse(str,
            (item) => {
                //opentag
                let lvl_key = JSON.stringify([p]);
                let _key = '';
                if (item.attr.find(c => c['key'] == "r-if")?.value[0] === "false") {
                    _key = undefined
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
                el.id = _key;
                p.push(map[lvl_key]);

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
                //closedtag
                parentStack.pop();
                p.pop();
            });
        return res;

    };
}