import axios from "axios"

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
| A single pre-configured axios client for the whole app. Every API call
| goes through this, so the backend base URL is defined in exactly one
| place. In production, only VITE_API_URL changes.
*/

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;