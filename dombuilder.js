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
    numChild = 0;
    visible = true;
    rIf = false;
}

class dom_element_reverse {
    id;
    childrens = [];
    innerTEXT = '';
    parrent = [];
    numChild = 0;
    tag;
    closedtag;
    visible = true;
    rIf = false;
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
        var counter = 0;
        var res = [];
        str = utils.str_format_line_break(str);
        var dom = str.split("\n").filter(item => item !== ""); //???.map(item => item.trim())
        var parrentHierarchy = [];
        var utils = {
            isOpenTag(str) {
                return str && str.includes("<") && str.includes(">") && !str.includes("</");
            },
            isClosedTag(str) {
                return str && str.includes("</");
            },
            isRIf(str) {
                return str.includes("r-if")
            },
            getName() {
                return counter++
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
        function deep(index, parrent = false, tag = '', numChild = 0) {
            if (utils.isOpenTag(dom[index])) {
                let el = new dom_element();
                res.push(el);
                el.tag = tag;
                el.id = utils.getName();
                if (parrent) {
                    parrentHierarchy.push(parrent.id);
                    el.parrent = JSON.parse(JSON.stringify(parrentHierarchy));
                }
                el.numChild = numChild;
                //r-if
                if (utils.isRIf(dom[index])) {
                    el.rIf = true;
                    let visible = (dom[index].split("r-if")[1].match(RegExp('"(.*?)"', 'g'))[0].split("\"").join(""));
                    if (visible === 'false') {
                        el.visible = false;
                    } else {
                        el.visible = true;
                    }
                }
                //
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
                        if (utils.isOpenTag(dom[i])) {
                            deepIds.push(i);
                        }
                    }
                    if (find === 0) {
                        if (!utils.isClosedTag(dom[i])) {
                            el.innerTEXT += dom[i];
                        }
                    }
                    if (find === -1) {
                        deepIds.forEach((index, numChild) => {
                            deep(index, el, dom[index], numChild);
                        });
                        parrentHierarchy.pop();
                        break;
                    }
                }
            }
        }

        deep(0, false, '<dom>');
        return this._reverseDom(res);
    }

    _reverseDom(dom) {


        //todo
        var closedTag = (tag) => {
            if (tag.includes('div')) {
                return "</div>";
            }
            if (tag.includes('button')) {
                return "</button>";
            }
            if (tag.includes('span')) {
                return "</span>";
            }
            if (tag.includes('ul')) {
                return "</ul>";
            }
            if (tag.includes('li')) {
                return "</li>";
            }
            if (tag.includes('input')) {
                return "</span>";
            }
        }
        //

        var reverseDom = [];
        for (let index = 0; index <= dom.length - 1; index++) {
            let el = new dom_element_reverse();
            reverseDom.push(el);
            el.id = dom[index].id;
            el.innerTEXT = dom[index].innerTEXT;
            el.tag = dom[index].tag;
            el.parrent = dom[index].parrent;
            el.visible = dom[index].visible;
            el.rIf = dom[index].rIf;
            el.numChild = JSON.parse(JSON.stringify(dom[index].numChild));
            el.closedtag = closedTag(el.tag);
            for (let j = index; j <= dom.length - 1; j++) {
                if (dom[j].parrent) {
                    if (dom[j].parrent[dom[j].parrent.length - 1] === el.id) {
                        el.childrens.push(dom[j].id);
                    }
                }
            }
        }
        return reverseDom;
    }
}

