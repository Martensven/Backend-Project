import express from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/cart.js';
import { Item } from '../models/items.js';
import { User } from '../models/users.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url'

    const router = express.Router();

// Lägg till vara i varukorgen
router.post('/add', async (req, res) => {
    try {
        const { item_id, quantity } = req.body;
        if (!item_id || !quantity) {
            return res.status(400).json({ message: 'Item ID and quantity are required' });
        }

        const item = await Item.findById(item_id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        let cart;
        if (req.user) {
            // Om användaren är inloggad - lagra varukorgen i databasen
            cart = await Cart.findOne({ user_id: req.user.userId });
            if (!cart) {
                cart = new Cart({ user_id: req.user.userId, items: [] });
            }
        } else {
            // Om användaren är gäst - lagra varukorgen i sessionen
            if (!req.session.cart) {
                req.session.cart = { items: [] };
            }
            cart = req.session.cart;
        }

        // Kolla om varan redan finns i varukorgen
        const existingItem = cart.items.find(i => i.item_id.toString() === item_id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ item_id, quantity });
        }

        if (req.user) {
            await cart.save(); // Spara varukorgen i databasen om användaren är inloggad
        } else {
            req.session.cart = cart; // Spara varukorgen i sessionen om användaren är gäst
        }

        res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        let cart;
        if (req.session.userId) {
            // Hämta från databasen om inloggad
            cart = await Cart.findOne({ user_id: req.session.userId })
                .populate('items.item_id', 'title price desc'); // Se till att vi hämtar 'title', 'price', och 'desc'
        } else {
            // Hämta från sessionen om gäst
            cart = req.session.cart || { items: [] };
        }

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const enhancedItems = await Promise.all(cart.items.map(async item => {
            let itemObject;
        
            if (typeof item.item_id === 'object' && item.item_id !== null) {
                // Inloggad användare (Mongoose-dokument)
                itemObject = item.item_id.toObject ? item.item_id.toObject() : item.item_id;
            } else {
                // Gästanvändare (item_id är en sträng) – hämta från databasen
                itemObject = await Item.findById(item.item_id).lean() || { _id: item.item_id, title: "Unknown", price: 0, desc: "" };
            }
        
            return {
                ...itemObject,
                quantity: item.quantity,
                totalPrice: itemObject.price * item.quantity
            };
        }));

        // Beräkna grandTotal
        const grandTotal = enhancedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        res.json({
            cart: {
                items: enhancedItems,
                grandTotal
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Rensa varukorgen (t.ex. vid utloggning)
router.post('/remove', async (req, res) => {
    try {
        const { item_id } = req.body;
        if (!item_id) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        let cart;
        if (req.session.userId) {
            // Inloggad användare - hämta varukorgen från databasen
            cart = await Cart.findOne({ user_id: req.session.userId });
            if (!cart) return res.status(404).json({ message: 'Cart not found' });

            // Hitta varan i varukorgen
            const itemIndex = cart.items.findIndex(i => i.item_id.toString() === item_id);
            if (itemIndex !== -1) {
                if (cart.items[itemIndex].quantity > 1) {
                    cart.items[itemIndex].quantity -= 1;
                } else {
                    cart.items.splice(itemIndex, 1);
                }
                await cart.save();
            }
        } else {
            // Gästanvändare - hämta varukorgen från sessionen
            if (!req.session.cart) req.session.cart = { items: [] };
            cart = req.session.cart;

            const itemIndex = cart.items.findIndex(i => i.item_id === item_id);
            if (itemIndex !== -1) {
                if (cart.items[itemIndex].quantity > 1) {
                    cart.items[itemIndex].quantity -= 1;
                } else {
                    cart.items.splice(itemIndex, 1);
                }
                req.session.cart = cart;
            }
        }

        res.json({ message: 'Item quantity updated', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

    export default router;
