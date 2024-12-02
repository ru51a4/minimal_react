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
            }, (item) => {
                //opentag

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
            });

        return res;
    }
}


