import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from './api';
import { toast } from 'react-toastify';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchOrders();
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch orders');
                toast.error('Error fetching orders');
            }
        };

        loadOrders();
    }, []);

    if (error) return <div>{error}</div>;

    const handleStatusUpdate = async (orderId, status) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, status);
            toast.success(`Order ${status}`);

            // Uppdatera ordersidan direkt
            const updatedOrders = await fetchOrders();
            setOrders(updatedOrders);

        } catch (err) {
            toast.error('Failed to update order status');
        }
    };



    return (
        <div>
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <ul>
                    {orders.map(order => {
                        const now = new Date();
                        const deliveryDeadline = new Date(order.delivery_time);
                        const isDeliveryPassed = now >= deliveryDeadline;

                        return (
                            <li key={order._id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0', display: 'flex', alignItems: 'center' }}>
                                <div>
                                    <h3>Order {order._id}</h3>
                                    <p>Status: {order.status}</p>
                                    <p>Total Price: {order.total_price} kr</p>
                                    <p>Items:</p>
                                    <ul>
                                        {order.items.map(item => (
                                            <li key={item._id}>
                                                {item.title} x {item.quantity} - {item.price * item.quantity} kr
                                            </li>
                                        ))}
                                    </ul>
                                    <p>Delivery Time: {order.delivery_time}</p>

                                    {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(order._id, 'Completed')}>Complete</button>
                                            <button onClick={() => handleStatusUpdate(order._id, 'Cancelled')}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default OrderList;
