class component_menu extends component {
    state = {
        menu: null
    };
    body() {
        return `
                <div class="zhs-menu" style="position:absolute; z-index:999999;">
                        ${this.state?.res?.reduce((acc, item, i) => acc +
            `<col r-repeat="res" r-index="${i}">
                        ` + "\n", '')}
                </div>
                `;
    }
    init() {
        let kek = [];
        let init = false;
        _store.catalog.subscribe((data) => {
            if (!data) {
                return;
            }
            if (!init) {
                init = true;
            } else {
                return;
            }
            let $tree = data.tree
            console.log($tree)

            let $zhsmenu = { "childrens": [] };
            let $deep = ($c, id) => {
                let $q = {};
                $q["title"] = $c["key"];
                $q['id'] = id;
                for (let $key of Object.keys($c)) {
                    if (!$q["childrens"]) {
                        $q["childrens"] = [];
                    }
                    if (Number($key) == $key) {
                        let qq = $deep($c[$key], $key);
                        $q["childrens"].push(qq);
                    }
                }

                return $q;
            };

            $zhsmenu["childrens"] = $deep($tree[1], 1);
            this.state.menu = $zhsmenu["childrens"];
            _store.lvl.next(null);
        });

        _store.lvl.subscribe((e) => {
            if (!this.state.menu) {
                return
            }
            let title = e?.title;
            let lvl = e?.lvl;
            if (e) {
                kek = kek.filter((c) => c?.lvl < lvl);
                kek.push(e);
            }
            _store.clvls.next(kek)
            let menu = this.state.menu;
            let getParrent = (node, prev) => {
                node.parent = prev?.title;
                node?.childrens.forEach((item) => {
                    getParrent(item, node);
                })
            };
            getParrent(menu);

            let t = [];
            let queue = [...menu.childrens];
            let res = [];
            let c = [];
            let counter = 0;
            while (queue.length) {
                let item = queue.shift();
                let next = (item.childrens.length) ? "➯" : "";
                let display = !res.length ? true : res.length <= lvl && !item.parent || kek.map(c => c.title).includes(item.parent) ? true : false;
                c.push({ ...item, next: next, display })
                t.push(...item.childrens);
                if (!queue.length) {
                    counter = 0;
                    res.push({ val: c })
                    c = [];
                    queue.push(...t);
                    t = [];
                }
            }
            this.state.res = res
            Render.renderDom();
        })
    }
}

class component_col extends component {
    state = {};
    destroy() {
        console.log(this.name)
    }
    init() {
        _store.lvl.subscribe(() => {
            let lvl = Number(this.index);
            this.state.margin = _store.clvls.getValue().filter(c => c.lvl <= Number(lvl - 1)).reduce((acc, item) => acc + item.i * 52, 0);
        })
    }
    body() {
        return `
             <div class="zhs-menu--items" style="margin-top:${this.state.margin}px">
             ${Object.values(this.getProps().val)?.filter((c) => c.display).reduce((acc, item, i) => acc +
            `
                                 <div onclick="_store.cSection.next(${item['id']})" onmousemove="_store.lvl.next({title:'${item.title}', lvl:${this.index}, i:${i}})" class="zhs-menu--items--item">
                    <span>
                        ${item.title} ${item.next} 
                    </span>
                </div>
                 ` + "\n", '')}
                </div>                

            `;
    }
}