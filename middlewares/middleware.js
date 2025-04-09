import express from 'express';
import jwt from 'jsonwebtoken';

export const middleWare = (app) => {
    app.use(express.json()); // bara express.json() middleware
};

// Middleware för att verifiera JWT-token
export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        // Ingen token innebär att vi tillåter gästanvändare
        req.user = null;
        return next(); // Fortsätt till nästa middleware
    }

    try {
        // Verifiera token om den finns
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

export default { middleWare };
