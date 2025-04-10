import express from 'express';
import { Cart } from '../models/cart.js';
import { Item } from '../models/items.js';
import { User } from '../models/users.js';
import { authMiddleware } from '../middlewares/middleware.js';
import { applyCampaigns } from '../middlewares/campaignsValidation.js';
import { validateData } from '../middlewares/dataValidation.js';
import { validateCartPrices } from '../middlewares/validateCartPrices.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        let cart;
        let userInfo = null;

        // För inloggade användare
        if (req.user?._id) {
            userInfo = await User.findById(req.user._id).lean();
            cart = await Cart.findOne({ user_id: req.user._id })
                .populate('items.item_id', 'title price desc');
        } 
        // För gäst användare
        if (!cart) {
            cart = req.session.cart || { items: [] };
        }

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Bearbetning av varorna i varukorgen
        const itemsToProcess = cart.items || [];

        const enhancedItems = await Promise.all(
            itemsToProcess.map(async (item) => {
                // kontrollera att item.item_id är korrekt
                const itemDetails = item.item_id ? item.item_id : await Item.findById(item.item_id);

                return {
                    _id: itemDetails._id,
                    title: itemDetails.title,
                    price: itemDetails.price,
                    quantity: item.quantity,
                    totalPrice: item.quantity * itemDetails.price
                };
            })
        );

        const campaignResults = applyCampaigns(enhancedItems);

        // Logga ut varukorgen och första varan för att se strukturen
        console.log("Cart:", cart);
        console.log("First Item:", cart.items[0].item_id);

        // Skicka responsen med den bearbetade varukorgen
        res.json({
            cart: {
                items: enhancedItems.map(item => ({
                    _id: item._id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    itemTotal: item.totalPrice
                })),
                campaigns: campaignResults.appliedCampaigns,
                pricing: {
                    originalTotal: campaignResults.originalPrice,
                    totalDiscount: campaignResults.totalDiscount,
                    finalPrice: campaignResults.newPrice
                },
                UserInformation: {
                    first_name: userInfo?.first_name || "Guest",
                    last_name: userInfo?.last_name || "Guest",
                    email: userInfo?.email || "Guest",
                    street: userInfo?.street || "Guest",
                    zip_code: userInfo?.zip_code || "Guest",
                    city: userInfo?.city || "Guest",
                }
            }
        });
    } catch (error) {
        console.error("Cart route error:", error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});
;
// Lägg till vara i varukorgen
router.post('/add', authMiddleware,
    validateData(['item_id', 'quantity'], {
        item_id: 'string',
        quantity: 'number'
        }),
        // Validerar pricerna i varukorgeen genom att jämföra med databasen
        validateCartPrices, 
        async (req, res) => {
        try {
            const { item_id, quantity } = req.body;

            const item = await Item.findById(item_id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            let cart;
            if (req.user) {
                cart = await Cart.findOne({ user_id: req.user._id });
                if (!cart) {
                    cart = new Cart({ user_id: req.user._id, items: [] });
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
                existingItem.price = item.price; 
                existingItem.title = item.title; 
            } else {
                // Lägg till pris här också
                cart.items.push({ item_id, quantity, price: item.price, title: item.title });

            }

            if (req.user) {
                await cart.save();
                await cart.populate('items.item_id', 'title price desc');
            } else {
                req.session.cart = cart;
            }
            console.log(`✔️ Pris validerat: ${item.title} har pris ${item.price} kr och har lagts till i varukorgen.`);
            res.status(200).json({ 
                message: 'Item added to cart', 
                addedItem: { 
                    _id: item._id, 
                    title: item.title, 
                    price: item.price, 
                    quantity: quantity 
                }, 
                cart 
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

router.post('/remove', authMiddleware,
    // Validera att item_id finns och är av rätt typ
    validateData(['item_id'], { item_id: 'string' }),
    async (req, res) => {
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

            if (req.user?._id) {
                // Kollar loggad user
                cart = await Cart.findOne({ user_id: req.user._id })
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