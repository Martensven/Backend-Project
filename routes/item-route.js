import express from 'express';
import { Item } from '../models/items.js';

const router = express.Router();

// GET alla items - ändra från '/items' till '/'
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// GET specifik item - behåll '/:id'
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'No item found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// GET specifik item med numeriskt id
router.get('/by-number/:id', async (req, res) => {
    try {
        const item = await Item.findOne({ id: Number(req.params.id) });
        
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'No item found with that id'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});
export default router;