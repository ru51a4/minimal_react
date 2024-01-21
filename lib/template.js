class dom_node {
    childrens = [];
    innerTEXT = '';
    tag;
}

class _template {
    static render = (str, component) => {
        let dom = _template.html_to_dom(str);
        let html = '';
        let stack = [component.state];
        let getVal = (key) => {
            for (let i = stack.length - 1; i >= 0; i--) {
                let val = stack[i]?.[key]
                if (val !== undefined) {
                    if (typeof val === 'function') {
                        return val();
                    }
                    return val;
                }
            }
        }
        let sumHtml = (node, key = null, i = null, value, _for = false) => {
            node.tag = node.tag.trim();

            let type_for = node?.attr?.find((c) => c['key'] === 'r-for')?.value[0];
            let type_if = node?.attr?.find((c) => c['key'] === 'r-if')?.value[0];
            let bind = node?.attr?.find((c) => c['key'] === 'r-bind')?.value[0];
            let r_click = node?.attr?.find((c) => c['key'] === 'r-click')?.value[0];;
            let r_mouse = node?.attr?.find((c) => c['key'] === 'r-mouse')?.value[0];;
            let r_change = node?.attr?.find((c) => c['key'] === 'r_change')?.value[0];;

            if (type_for && !key) {
                let val = getVal(type_for)
                if (!val?.length) {
                    html += "\n" + `<${node.tag} r-index="0" r-type="destroy" r-repeat="${type_for}"> </${node.tag}>`
                }
                for (let j = 0; j <= val?.length - 1; j++) {
                    value = val?.[j]
                    stack.push(JSON.parse(JSON.stringify(value)));
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
                if (bind?.split(";").length > 1) {
                    _attr = bind.split(";").map((c) => {
                        if (c.split(".").length > 1) {
                            return { attr: c.split(".")[0], val: getVal(c.split(".")[1]) }
                        }
                        return { val: c }
                    })
                } else if (bind?.includes(".")) {
                    attr = bind.split(".")[0];
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
                if (r_change) {
                    if (r_change.includes(".")) {
                        r_change = ` onmousemove="runEvent('${component.name}', '${r_change.split(".")[0]}', '${getVal(r_change.split(".")[1])}') "`
                    } else {
                        r_change = ` onmousemove="runEvent('${component.name}', '${r_change}') "`
                    }
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
                    ((r_change) ? r_change : '') +
                    ((r_mouse) ? r_mouse : '') + ">"
                html += "\n"
                html += node.innerTEXT ?? '';
                html += "\n"
                if (bind && !attr) {
                    html += getVal(bind);
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


