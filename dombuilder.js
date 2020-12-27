/*
<html>
<div>
<div>
asd
</div>
<div>
asd2
ads33
</div>
<div>
<div>
ddd
</div>
</div>
</div>
</html>
*/


class dom_element {
    id;
    parrent;
    innerTEXT = '';
    tag;
}

class dom_element_reverse {
    id;
    childrens = [];
    innerTEXT = '';
    tag;
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
        var utils = {
            isOpenTag(str) {
                return str && str.includes("<") && str.includes(">") && !str.includes("</");
            },
            isClosedTag(str) {
                return str && str.includes("</");
            },
            uuidv4() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            str_format_line_break(str) {
                let res = '';
                for (var i = 0; i <= str.length - 1; i++) {
                    res += str[i];
                    if (str[i] === ">") {
                        res += "\n";
                    }
                    if (str[i + 1] && str[i + 1] === "<" && str[i + 2] && str[i + 2] === "/" && (str[i] !== '>' || str[i] !== "\n")) {
                        res += '\n';
                    }
                }
                return res;
            }
        };

        var res = [];
        str = utils.str_format_line_break(str);
        var dom = str.split("\n").filter(item => item !== ""); //???.map(item => item.trim())

        function deep(index, parrent = false, tag = '') {
            if (utils.isOpenTag(dom[index])) {
                let el = new dom_element();
                res.push(el);
                el.tag = tag;
                el.id = utils.uuidv4();
                if (parrent) {
                    el.parrent = parrent.id;
                }

                let find = 0;
                let deepIds = [];

                for (let i = index + 1; i <= dom.length - 1; i++) {
                    if (utils.isOpenTag(dom[i])) {
                        find++;
                    }
                    if (utils.isClosedTag(dom[i])) {
                        find--;
                    }
                    if (find === 1) {
                        deepIds.push(i);
                    }
                    if (find === 0) {
                        if (!utils.isClosedTag(dom[i])) {
                            el.innerTEXT += dom[i];
                        }
                    }
                    if (find === -1) {
                        deepIds.forEach((index) => {
                            deep(index, el, dom[index]);
                        });
                        break;
                    }
                }
            }
        }

        deep(0, false, '<dom>');
        return this._reverseDom(res);
    }

    _reverseDom(dom) {
        var reverseDom = [];
        for (let index = 0; index <= dom.length - 1; index++) {
            let el = new dom_element_reverse();
            reverseDom.push(el);
            el.id = dom[index].id;
            el.innerTEXT = dom[index].innerTEXT;
            el.tag = dom[index].tag;
            for (let j = index; j <= dom.length - 1; j++) {
                if (dom[j].parrent === el.id) {
                    el.childrens.push(dom[j].id);
                }
            }
        }
        return reverseDom;
    }
}

