import express from 'express';
import { Item } from '../models/items.js';
import validateData from '../middlewares/dataValidation';
import mongoose from 'mongoose';

const router = express.Router();

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Alla varor i items
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

// Get för _id 
router.get('/:id', 
    // Validera att id är en sträng
    validateData(['id'], { id: 'string' }),
    async (req, res) => {
        try {
            // Validera om ID är giltigt MongoDB ObjectId
            if (!isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid item ID format'
                });
            }

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

// GET specifik item by number
router.get('/by-number/:id', 
    // Validera att ID är en sträng som konverteras till ett nummer
    validateData(['id'], { id: 'string' }),
    async (req, res) => {
        try {
            // Konvertera nummer och validera
            const numericId = Number(req.params.id);
            
            if (isNaN(numericId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid numeric ID'
                });
            }

            const item = await Item.findOne({ id: numericId });

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