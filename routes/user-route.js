import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/users.js';


dotenv.config();
const router = express.Router();

// Registrera en ny användare
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, street, zip_code, city, password } = req.body;

        if (!first_name || !last_name || !email || !street || !zip_code || !city || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'E-mail already exists' });
        }

        // Hasha lösenordet innan det sparas
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            first_name,
            last_name,
            email,
            street,
            zip_code,
            city,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Inloggning med JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Jämför hashen av det inskickade lösenordet med det sparade hashlösenordet
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Skapa JWT-token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to login', details: error.message });
    }
});


export default router;


