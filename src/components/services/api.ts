import axios from "axios";

export const api = axios.create({
    baseURL: 'https://api.clarifai.com',
    headers: {
        "Authorization": "Key accd4c3429884caaa55280083b485b30"
    }
})