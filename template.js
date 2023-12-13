class dom_node {
    childrens = [];
    innerTEXT = '';
    tag;
}

class _template {
    static render = (str) => {
        let dom = _template.html_to_dom(str);
        let html = '';
        let sumHtml = (node) => {
            html += '<' + node.tag + ((node.attr.length > 1) ? ' ' : '') + `${node.attr.reduce((acc, item, i) => acc + ((item.key !== 'tag') ? `${item.key}="${item.value.join(" ")}"${((node.attr.length - 1 != i + 1) ? ' ' : '')}` : ''), '')}` + ">"
            html += node.innerTEXT;
            node.childrens.forEach((node) => {
                sumHtml(node);
            });
            html += '</' + node.tag + '>';
        }
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