import express from 'express';
import { Cart } from '../models/cart.js';
import { Item } from '../models/items.js';


const router = express.Router();

// Fixed kampanjer som finns för affären
export const calculateCampaigns = (items) => {
    const now = new Date();
    const juneEnd = new Date(now.getFullYear(), 5, 30); // till slutet av juni
    
    let totalDiscount = 0;
    const appliedCampaigns = [];
    const originalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 1. 10% rabatt under perioden (idag till 30 juni)
    if (now <= juneEnd) {
        const discount = originalPrice * 0.1;
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
            discount: discount,
            type: "percentage"
        });
    }
    
    // 2. 50 kr rabatt om mer än 5 varor
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 5) {
        totalDiscount += 50;
        appliedCampaigns.push({
            name: "Rabatt på storköp (50 kr för 5+ varor)",
            discount: 50,
            type: "fixed"
        });
    }
    
    // 3. 10 kr rabatt på bryggkaffe
    const coffeeItems = items.filter(item => 
        item.title.toLowerCase().includes('bryggkaffe')
    );
    
    if (coffeeItems.length > 0) {
        const discount = coffeeItems.reduce((sum, item) => sum + (10 * item.quantity), 0);
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "10 kr rabatt på bryggkaffe",
            discount: discount,
            type: "item_discount"
        });
    }
    
    return { 
        totalDiscount: Math.min(totalDiscount, originalPrice), // Förhindra negativa summor
        appliedCampaigns,
        originalPrice,
        newPrice: Math.max(0, originalPrice - totalDiscount)
    };
};

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

            cart = await Cart.findOne({ user_id: req.user.userId });
            if (!cart) {
                cart = new Cart({ user_id: req.user.userId, items: [] });
            }
        } else {
            if (!req.session.cart) {
                req.session.cart = { items: [] };
            }
            cart = req.session.cart;
        }

        const existingItem = cart.items.find(i => i.item_id.toString() === item_id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ item_id, quantity });
        }

        if (req.user) {
            await cart.save();
        } else {
            req.session.cart = cart;

        }
        res.status(200).json({ message: 'Item added to cart', addedItem: {
            _id: item._id,
            title: item.title,
            quantity: existingItem ? existingItem.quantity : quantity
        } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        let cart;
        if (req.session.userId) {
            cart = await Cart.findOne({ user_id: req.session.userId })
                .populate('items.item_id', 'title price desc');
        } else {

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
        // Beräkna kampanjer
        const { totalDiscount, appliedCampaigns, originalPrice, newPrice } = 
            calculateCampaigns(enhancedItems);


        res.json({
            cart: {
                items: enhancedItems,

                originalPrice,
                newPrice,
                totalDiscount,
                appliedCampaigns

            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/remove', async (req, res) => {
    try {
        const { item_id, quantity = 1 } = req.body; // om man inte anger quantity, sätts den till 1
        
        if (!item_id) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        let cart;
        let itemDetails = null;
        let removedQuantity = 0;

        if (req.session.userId) {
            // Kollar loggad user
            cart = await Cart.findOne({ user_id: req.session.userId })
                          .populate('items.item_id', 'title price');
            
            if (!cart) return res.status(404).json({ message: 'Cart not found' });

            const itemIndex = cart.items.findIndex(i => i.item_id._id.toString() === item_id);
            
            if (itemIndex !== -1) {
                itemDetails = cart.items[itemIndex].item_id;
                const currentQuantity = cart.items[itemIndex].quantity;
                
                if (quantity >= currentQuantity) {
                    // Tar bort item helt om quantity sjunker till 0 eller mindre
                    removedQuantity = currentQuantity;
                    cart.items.splice(itemIndex, 1);
                } else {
                    
                    removedQuantity = quantity;
                    cart.items[itemIndex].quantity -= quantity;
                }
                
                await cart.save();
            }
        } else {
            // Guest user - session cart
            if (!req.session.cart) req.session.cart = { items: [] };
            cart = req.session.cart;

            const itemIndex = cart.items.findIndex(i => i.item_id === item_id);
            
            if (itemIndex !== -1) {
                // Get item details from database
                const item = await Item.findById(item_id).select('title price');
                itemDetails = item || { _id: item_id, title: "Unknown Item" };
                
                const currentQuantity = cart.items[itemIndex].quantity;
                
                if (quantity >= currentQuantity) {
                    removedQuantity = currentQuantity;
                    cart.items.splice(itemIndex, 1);
                } else {
                    removedQuantity = quantity;
                    cart.items[itemIndex].quantity -= quantity;
                }
                
                req.session.cart = cart;
            }
        }

        if (!itemDetails) {
            const item = await Item.findById(item_id).select('title').lean() || 
                         { _id: item_id, title: "Unknown Item" };
            itemDetails = item;
        }

        if (removedQuantity > 0) {
            res.json({ 
                success: true,
                message: `Successfully removed ${removedQuantity} ${removedQuantity === 1 ? 'item' : 'items'}`,
                removedItem: {
                    _id: itemDetails._id,
                    title: itemDetails.title,
                    quantityRemoved: removedQuantity,
                    remainingQuantity: cart.items.find(i => 
                        i.item_id._id?.toString() === item_id || 
                        i.item_id.toString() === item_id
                    )?.quantity || 0
                },
                cart
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: 'Item not found in cart' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

export default router;