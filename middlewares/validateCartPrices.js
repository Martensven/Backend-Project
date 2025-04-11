import { Item } from '../models/items.js';

export const validateCartPrices = async (req, res, next) => {
    try {
        const { item_id } = req.body;

        if (!item_id) {
            return res.status(400).json({ message: 'item_id is required' });
        }

        const item = await Item.findById(item_id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in database' });
        }

        // Lägg till item-priset i request body för senare användning
        req.itemData = item;

        next();
    } catch (error) {
        console.error('Error in validateItemExists middleware:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
