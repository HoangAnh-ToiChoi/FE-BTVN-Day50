import axios from "axios";

export const BASE_API =
    import.meta.env.VITE_BASE_API || "http://localhost:3000";

export const httpClient = axios.create({
    baseURL: BASE_API,
});

const _send = async (url, method, data, config) => {
    try {
        const response = await httpClient.request({
            ...config,
            url,
            method,
            data,
        });

        return response.data?.data ?? response.data;
    } catch (error) {
        throw error.response?.data ?? { message: error.message };
    }
};

const get = async (path, config) => {
    return await _send(path, "get", null, config);
};

const post = async (path, data, config) => {
    return await _send(path, "post", data, config);
};

const put = async (path, data, config) => {
    return await _send(path, "put", data, config);
};

const patch = async (path, data, config) => {
    return await _send(path, "patch", data, config);
};

const del = async (path, config) => {
    return await _send(path, "delete", null, config);
};

const http = { get, post, put, patch, del };

export default http;
