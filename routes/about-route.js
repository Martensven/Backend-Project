import express from 'express';
import { About } from './about-model';
import validateData from '../middlewares/dataValidation';

const router = express.Router();

router.post('/create', 
    // Validera data och datayper
    validateData(['title'], { title: 'string' }), 
    async (req, res) => {
        try {
            const { title, content } = req.body;
            const newAbout = new About({ title, content });
            const savedAbout = await newAbout.save();

            res.status(201).json(savedAbout);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

export default router;