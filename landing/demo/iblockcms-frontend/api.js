
class Api {
    static apiUrl = "http://188.120.245.72:8082/api";
    static getCatalog = (sectionId, page) => {
        return axios.get(`${this.apiUrl}/index/${sectionId}/${page}`)
    }
    static getProduct = (id) => {
        return axios.get(`${this.apiUrl}/detail/${id}`)
    }


}