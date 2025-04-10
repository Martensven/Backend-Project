const BASE_URL = 'http://localhost:4321';

export const getToken = () => localStorage.getItem('token');

export const fetchWithAuth = (url, options = {}) => {
    const token = getToken();
    return fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    });
};