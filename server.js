// Imports
import express from 'express';
import { connectDB } from './config/db.js';
import { middleWare } from './middlewares/middleware.js';
import userRoutes from './routes/user-route.js';
import itemRoutes from './routes/item-route.js';
import orderRoutes from './routes/order-route.js';
import cartRoutes from './routes/cart-route.js';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

const app = express(); // Skapa app först!
const PORT = 4321;

// Middleware
app.use(middleWare());
app.use(express.json());
app.use(cookieParser());
await middleWare();

// Routes
app.use('/user', userRoutes);
app.use('/items', itemRoutes);
app.use('/orders', orderRoutes);
app.use('/cart', cartRoutes);

// Anslut till databasen och starta servern
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to database:', err);
    });









