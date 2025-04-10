import express from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/orders.js';
import { Cart } from '../models/cart.js';
import { Item } from '../models/items.js';
import { calculateCampaigns } from '../middlewares/campaignsValidation.js';
import { authMiddleware } from '../middlewares/middleware.js';
import { validateData } from '../middlewares/dataValidation.js';

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/', authMiddleware, async (req, res) => {
    try {
        let cart;
        let userId;

        if (req.user) {
            userId = req.user.userId;
            cart = await Cart.findOne({ user_id: userId });
        } else {
            if (!req.session.cart || req.session.cart.items.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }
            cart = req.session.cart;
        }

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or invalid' });
        }

        // Enrich cart items with full data from Item model
        const enrichedItems = await Promise.all(cart.items.map(async (item) => {
            const fullItem = await Item.findById(item.item_id);
            if (!fullItem) return null;

            return {
                item_id: fullItem._id,
                title: fullItem.title,
                description: fullItem.description || '',
                price: fullItem.price,
                quantity: item.quantity
            };
        }));

        const filteredItems = enrichedItems.filter(item => item !== null);
        if (filteredItems.length === 0) {
            
            return res.status(400).json({ message: 'No valid items in cart' });
        }

        // Prepare simplified items for campaign calculation
        const preparedItems = filteredItems.map(item => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity
        }));

        const { newPrice, totalDiscount, appliedCampaigns, originalPrice } = calculateCampaigns(preparedItems);

        const deliveryMinutes = Math.floor(Math.random() * 60) + 1;
        const deliveryTime = `${deliveryMinutes} min`;

        const newOrder = new Order({
            user_id: userId || undefined,
            total_price: newPrice,
            original_price: originalPrice,
            discount_applied: totalDiscount,
            applied_campaigns: appliedCampaigns,
            delivery_time: deliveryTime,
            items: filteredItems, // contains title, description, price, quantity
            user_info: {
                first_name: 'Guest',
                last_name: 'Guest',
                email: 'Guest',
                street: 'Guest',
                zip_code: 'Guest',
                city: 'Guest'
            }
        });

        await newOrder.save();

        // Clear cart
        if (req.user) {
            await Cart.findOneAndDelete({ user_id: userId });
        } else {
            req.session.cart = null;
        }

        res.status(201).json({ message: 'Order created successfully', order: newOrder, orderId: newOrder._id });
    } catch (error) {
        console.error("Error during order creation:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



//visar upp den specifika datan från userId 
router.get('/history/user', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const orders = await Order.find({ user_id: userId }).populate('items.item_id');
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

//GET Order ID
router.get('/history/:orderId', validateData(['orderId'], { orderId: 'string' }, 'params'), async (req, res) => {
    try {
        const orderId = req.params.orderId;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId).populate('items.item_id');
        if (!order) {
            return res.status(404).json({ message: 'Orders not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

//PUT för Complete och Cancelled 
router.put('/status/:orderId', authMiddleware, validateData(['orderId'], { orderId: 'string' }, 'params'), validateData(['status'], { status: 'string' }, 'body'), async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if(!isValidObjectId(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        if (!status || !['Completed', 'Cancelled'].includes(status)) {
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

router.get('/test', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'You are authorized', user: req.user });
});

export default router;
