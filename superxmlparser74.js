class superxmlparser74 {
    static parse(str, cbOpenTag, cbInnerText, cbClosedTag, cbSelfOpenTag = () => {
    }) {
        let isOpen = false;
        let startAttr = false;
        let t = ''
        let tAttrKey = '';
        let tAttrValue = '';
        let tAttrStart = false;
        let tAttr = '';
        let attr = [];
        let prevCh = '';
        for (let i = 0; i <= str.length - 1; i++) {
            //(1)<li (2)class="breadcrumb-item-selected text-gray-light breadcrumb-item text-mono h5-mktg" aria-current="GitHub Student Developer Pack"(3)>GitHub Student Developer Pack(4)</li(5)>
            //<selfclosing />
            //comments // <!-- -->
            if (str[i] === "<") { //1
                //comments <!-- -->
                if (str[i + 1] === '!' && str[i + 2] === "-" && str[i + 3] === "-") {
                    for (let j = i + 4; j <= str.length - 1; j++) {
                        if (str[j] === '-' && str[j + 1] === '-' && str[j + 2] === '>') {
                            i = j + 2;
                            break;
                        }
                    }
                    continue
                }
                ///

                if (t.trim() !== '' && t.trim() !== "\n" && t.trim() !== "\t") {
                    //cut innerTEXT 4
                    cbInnerText({
                        value: t
                    });
                    t = '';
                } else if (str[i + 1] !== "/") {
                    cbInnerText({
                        value: ""
                    });
                }
                //open tag
                isOpen = true;
                if (str[i + 1] === "/") {
                    isOpen = false;
                    i = i + 1;
                    continue;
                }
            } else if (str[i] === '>') {
                ///closed tag - build 3/5
                if (isOpen) {
                    if (prevCh === "/") {
                        cbSelfOpenTag({
                            tag: t,
                            attr: attr
                        })
                    } else {
                        cbOpenTag({
                            tag: t,
                            attr: attr,
                        })
                    }
                } else {
                    cbClosedTag({})
                }
                attr = [];
                t = '';
                startAttr = false;
                isOpen = false;
            } else {
                //accum str
                if ((!startAttr && str[i] !== ' ') || !isOpen) {
                    t += str[i];
                } else if (startAttr) { //get attr 2
                    if (str[i] === '=') {
                        tAttrKey = tAttr
                        tAttr = '';
                    } else if (str[i] === '"') {
                        tAttrStart = !tAttrStart;
                        if (tAttrStart === false) {
                            if (tAttrKey === 'class') {
                                tAttrValue = tAttr.split(" ");
                            } else {
                                tAttrValue = [tAttr];
                            }
                            tAttr = '';
                            attr.push({ key: tAttrKey, value: tAttrValue });
                            if (str[i + 1] === ' ') {
                                i = i + 1;
                                continue;
                            }
                        }
                    } else {
                        tAttr += str[i];
                    }

                } else if (str[i] === ' ' && isOpen) {
                    startAttr = true;
                }

            }
            prevCh = str[i];
        }
    }
}
