const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');


//translate
let key = "YOUR KEY";
let endpoint = "https://api.cognitive.microsofttranslator.com";
let location = "southeastasia";


exports.translate = async function (text, toLanguage) { // Accept toLanguage as a parameter
    try {
        const response = await axios({
            baseURL: endpoint, 
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params: {
                'api-version': '3.0',
                'from': 'en',
                'to': toLanguage // Use the toLanguage parameter here
            },
            data: [{ 'text': text }],
            responseType: 'json'
        });

        return response.data[0].translations[0].text;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};
