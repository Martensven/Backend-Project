    import express from 'express';
    import mongoose from 'mongoose';
    import { Cart } from '../models/cart.js';
    import fs from 'fs';
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
        // Hämta kundvagn för användaren
        let cart = await Cart.findOne({ user_id: req.params.userId });

        // Om ingen kundvagn finns, skapa en ny
        if (!cart) {
            cart = new Cart({ user_id: req.params.userId, items: [] });
        }

        // Omvandla id till ObjectId
        const itemIdObject = new mongoose.Types.ObjectId(id);

        // Kolla om produkten redan finns i kundvagnen
        const existingItem = cart.items.find(item => item.item_id.toString() === itemIdObject.toString());
        if (existingItem) {
            // Om produkten finns, öka kvantiteten
            existingItem.quantity += quantity;
        } else {
            // Annars lägg till produkten i kundvagnen
            cart.items.push({ item_id: itemIdObject, quantity });
        }

        // Spara kundvagnen i databasen
        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error('Error details:', error);  // Logga detaljer om fel
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
});


// GET Route för att hämta kundvagn
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.params.userId }).populate('items.item_id');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});

// DELETE Route för att ta bort produkt från kundvagn
router.delete('/:userId/:itemId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.params.userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Ta bort produkt från kundvagnen
        cart.items = cart.items.filter(item => item.item_id.toString() !== req.params.itemId);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error });
    }
});

    export default router;
