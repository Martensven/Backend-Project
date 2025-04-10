import express from 'express';
import { Cart } from '../models/cart.js';
import { Item } from '../models/items.js';
import { authMiddleware } from '../middlewares/middleware.js';


const router = express.Router();

// Lägg till vara i varukorgen
router.post('/add', authMiddleware, async (req, res) => {
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



router.get('/', authMiddleware, async (req, res) => {
    try {
        let cart;

        if (req.user && req.user.userId) {
            // För inloggad användare hämtar vi varukorgen från databasen
            cart = await Cart.findOne({ user_id: req.user.userId })
                .populate('items.item_id', 'title price desc');
        } else {
            // För gästanvändare hämtar vi varukorgen från sessionen (om du vill behålla stöd för gäster)
            cart = req.session.cart || { items: [] };
        }

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Enhancerar objektet för varje vara i varukorgen (lägger till pris, totalpris, osv.)
        const enhancedItems = await Promise.all(cart.items.map(async item => {
            let itemObject;

            if (typeof item.item_id === 'object' && item.item_id !== null) {
                // För inloggad användare (Mongoose-dokument)
                itemObject = item.item_id.toObject ? item.item_id.toObject() : item.item_id;
            } else {
                // För gästanvändare (item_id är en sträng) – hämtar från databasen
                itemObject = await Item.findById(item.item_id).lean() || { _id: item.item_id, title: "Unknown", price: 0, desc: "" };
            }

            return {
                ...itemObject,
                quantity: item.quantity,
                totalPrice: itemObject.price * item.quantity
            };
        }));

        // Beräkna kampanjer
        const { totalDiscount, appliedCampaigns, originalPrice, newPrice } = calculateCampaigns(enhancedItems);

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

router.post('/remove', authMiddleware, async (req, res) => {
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

        if (req.user?.userId) {
            // Kollar loggad user
            cart = await Cart.findOne({ user_id: req.user.userId })
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
