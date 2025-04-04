import express from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/cart.js';
import { Item } from '../models/items.js';
import { User } from '../models/users.js';
import path from 'path';
import {fileURLToPath} from 'url'

const router = express.Router();

// Lägg till vara i varukorgen
router.post('/add', async (req, res) => {

import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Hantera _dirname i ES-moduler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isValidMenuItem = async (itemId) => {
    try {
        // Anropar API ENDPOINT för att hämta items
        const response = await fetch(`http://localhost:4321/items/${itemId}`);

        // Kolla om produkten finns
        if (!response.ok) return false;

        const item = await response.json();
        return item !== null;
    } catch (error) {
        console.error("Error checking item:", error);
        return false;
    }
};

// POST Route för att lägga till produkt i kundvagn
router.post('/:userId', async (req, res) => {
    const { id, quantity } = req.body;

    // Validera input
    if (!id || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid item data' });
    }

    // Kontrollera att produkten finns i menyn
    if (!(await isValidMenuItem(id))) {
        return res.status(400).json({ message: 'Invalid product: Not on the menu' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product id' });
    }


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

router.put('/:userId/plus/:itemId', async (req, res) => {
    try {
        //Hitta kundvagn
        const cart = await Cart.findOne({ user_id: req.params.userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        //Hitta item i kundvagn
        const item = cart.items.find(item => item.item_id.toString() === req.params.itemId)

        if (!item) { return res.status(404).json({ message: 'item not found' }); }

        //Ökar med 1
        item.quantity += 1;

        //spara
        await cart.save();

        //Visa meddelande när vi lyckas lägga till item
        res.json({ message: 'Added one more!', cart });

    } catch (error) {
        res.status(500).json({ message: 'Error adding quantity of item!', error });
    }
})

router.put('/:userId/minus/:itemId', async (req, res) => {
    try {
        //Hitta kundvagn
        const cart = await Cart.findOne({ user_id: req.params.userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        //Hitta item i kundvagn
        const item = cart.items.find(item => item.item_id.toString() === req.params.itemId)

        if (!item) { return res.status(404).json({ message: 'item not found' }); }

        //Minska kvantitet med 1
        item.quantity -= 1;

        //spara
        await cart.save();

        //Visa meddelande när vi lyckas tagit bort item
        res.json({ message: 'Took one away!', cart });

    } catch (error) {
        res.status(500).json({ message: 'Error removing quantity of item!', error });
    }
})

// DELETE Route för att ta bort produkt från kundvagn
router.delete('/:userId/:itemId', async (req, res) => {

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
