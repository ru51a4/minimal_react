
class Api {
    static apiUrl = "http://188.120.245.72:8082/api";
    static getCatalog = (sectionId, page) => {
        return axios.get(`${this.apiUrl}/index/${sectionId}/${page}`, {

            headers: {

                'x-cors-api-key': 'temp_c1363218646395fd3f0af43e15fbae42'

            }

        })
    }
    static getProduct = (id) => {
        return axios.get(`${this.apiUrl}/detail/${id}`, {

            headers: {

                'x-cors-api-key': 'temp_c1363218646395fd3f0af43e15fbae42'

            }

        })
    }


}