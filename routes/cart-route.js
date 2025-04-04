import express from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/cart.js';


const router = express.Router();

const calculateCampaigns = (cartItems) => {
    const now = new Date();
    const juneEnd = new Date(now.getFullYear(), 5, 30); // Från och med idag till 30 juni
    
    let totalDiscount = 0;
    const appliedCampaigns = [];
    
    // 1. 10% rabatt till 30 juni
    if (now <= juneEnd) {
        const orignialPrice = cartItems.reduce((sum, item) => sum + (item.item_id.price * item.quantity), 0);
        const discount = orignialPrice * 0.1;
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
            discount: discount,
            type: "percentage"
        });
    }
    
    // 2. 50 kr rabatt om mer än 5 varor
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 5) {
        totalDiscount += 50;
        appliedCampaigns.push({
            name: "Rabatt på storköp (50 kr för 5+ varor)",
            discount: 50,
            type: "fixed"
        });
    }
    
    // 3. 10 kr rabatt på bryggkaffe
    const coffeeDiscountItems = cartItems.filter(item => 
        item.item_id.title.toLowerCase().includes('bryggkaffe')
    );
    
    if (coffeeDiscountItems.length > 0) {
        const discount = coffeeDiscountItems.length * 10;
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "10 kr rabatt på bryggkaffe",
            discount: discount,
            type: "item_discount"
        });
    }
    
    return { totalDiscount, appliedCampaigns };
};

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
        const cart = await Cart.findOne({ user_id: req.params.userId })
            .populate('items.item_id', 'title price description');
        
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Beräkna grundpriser
        const calcedItems = cart.items.map(item => ({
            ...item.toObject(),
            totalPrice: item.item_id.price * item.quantity
        }));

        const orignialPrice = calcedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        // Beräknar kampanjer
        const { totalDiscount, appliedCampaigns } = calculateCampaigns(cart.items);
        const newPrice = Math.max(0, orignialPrice - totalDiscount); // inga negativa totalsummor

        res.json({
            ...cart.toObject(),
            items: calcedItems,
            orignialPrice,
            newPrice,
            totalDiscount,
            appliedCampaigns
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});


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
