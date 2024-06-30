
class Api {
    static apiUrl = "http://iblock.1123875-cc97019.tw1.ru/api";
    static getCatalog = (sectionId, page) => {
        return axios.get(`${this.apiUrl}/index/${sectionId}/${page}`)
    }
    static getProduct = (id) => {
        return axios.get(`${this.apiUrl}/detail/${id}`)
    }


}