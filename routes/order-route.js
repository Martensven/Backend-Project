import express, { Router } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/orders.js';
import { Cart } from '../models/cart.js';

const router = express.Router();
const app = express();

//Hämtar items from cart.js genom en specifik user id
router.post('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const cart = await Cart.findOne({ user_id: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Cart is empty or not found' });
        }

        const total_price = cart.items.reduce((sum, item) => sum + item.item_id.price * item.quantity, 0)

        const newOrder = new Order({
            user_id: userId,
            total_price,
            items: cart.items.map(item => ({
                item_id: item.item_id._id,
                quantity: item.quantity
            }))
        });

        await newOrder.save();
        await Cart.findOneAndDelete({ user_id: userId });

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

//visar upp den specifika datan från userId 
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Type.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const orders = await Order.find({ user_id: user_id }).populate('items.item_id');
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

//GET Order ID
router.get('/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;

        if (!mongoose.Type.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const orders = await Order.find({ orderId: orderId }).populate('items.item_id');
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Orders not found' });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status (500).json({ message: 'Server Error', error });
    }
})

//PUT för Complete och Cancelled 
router.put('/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status ||['Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status, must be "Completed" or "Cancelled"' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not Found' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status has updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

export default router;

// Kolla auth, kolla runt lite på allt, kolla lösenord och sånt