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

// Hämta alla ordrar för användaren
export const fetchOrders = async () => {
    try {
        const response = await fetchWithAuth('/orders/user');
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Skapa en ny order
export const createOrder = async () => {
    try {
        const response = await fetchWithAuth('/orders', { method: 'POST', credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Uppdatera statusen för en order
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await fetchWithAuth(`/orders/status/${orderId}`, {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Failed to update order status');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};