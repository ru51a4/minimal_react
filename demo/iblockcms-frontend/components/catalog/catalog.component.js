class component_catalog extends component {
    state = {
        els: []
    };
    init() {
        _store.catalog.subscribe((data) => {
            this.state.els = data?.els;
        });
    }
    body() {
        return `
                <ul>
                ${this.state?.els?.reduce((acc, item, i) => acc +
            `
                                <li kek="${item.name}" class="card mb-4 d-flex justify-content-center">
                                    <div class="p-2">
                                        <span
                                            >${item.name}</span>
                                        <p>
                                            <img style="width:100px" src="http://iblock.1123875-cc97019.tw1.ru${item.prop['DETAIL_PICTURE']}">
                                        </p>
                                        <ul>
                                        ${Object.keys(item?.prop)?.map((key) => {
                return (key !== 'DETAIL_PICTURE' && key !== 'photo') ? `<li>${key} - ${item?.prop[key]}</li>` : ""
            }).join("")}
                                        </ul>
                                    </div>
                                </li>
                    ` + "\n", '')}
                        
                </ul>
            `;
    }
}