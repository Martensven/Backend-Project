import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/users.js';
import validateData from '../middlewares/dataValidation';

dotenv.config();
const router = express.Router();

// Email format validation 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registrera en ny användare
router.post('/register', 
    // Validate required fälten och datatyper
    validateData([
        'first_name', 'last_name', 'email', 
        'street', 'zip_code', 'city', 'password'
    ], {
        first_name: 'string',
        last_name: 'string',
        email: 'string',
        street: 'string',
        zip_code: 'string',
        city: 'string',
        password: 'string'
    }),
    async (req, res) => {
        try {
            const { 
                first_name, last_name, email, 
                street, zip_code, city, password 
            } = req.body;

            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            // Password strength check
            if (password.length < 8) {
                return res.status(400).json({ 
                    error: 'Password must be at least 8 characters long' 
                });
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
            res.status(500).json({ 
                error: 'Failed to create user', 
                details: error.message 
            });
        }
    }
);

// Inloggning med JWT
router.post('/login', 
    // Validate email och password
    validateData(['email', 'password'], {
        email: 'string',
        password: 'string'
    }),
    async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
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
            const token = jwt.sign(
                { userId: user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            res.json({ message: 'Login successful', token });
        } catch (error) {
            res.status(500).json({ 
                error: 'Failed to login', 
                details: error.message 
            });
        }
    }
);

export default router;

