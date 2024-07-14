class component_catalog extends component {
    state = {
        els: []
    };
    init() {
        _store.catalog.subscribe((data) => {
            this.state.els = data?.els.map((c) => {
                return {
                    ...c, img: `http://188.120.245.72:8082/` + c.prop["DETAIL_PICTURE"], prop:
                        Object.keys(c.prop)?.map((key) => {
                            return (key !== 'DETAIL_PICTURE' && key !== 'photo') ? `<li>${key} - ${c.prop[key]}</li>` : ""
                        }).join("")
                }
            });
        });
    }
    body() {
        return `
               <ul>
                <li r-for="els" class="card mb-4 d-flex justify-content-center">
                    <div class="p-2">
                        <span r-bind="name"></span>
                        <p>
                            <img style="width:100px" r-bind.src="img">
                            </img>
                        </p>
                        <ul>
                            <div r-bind="prop"></div>
                        </ul>
                    </div>
                </li>
            </ul>
            `;
    }
}