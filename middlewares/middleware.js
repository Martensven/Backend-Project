import express from 'express';

export const middleWare = (app) => {
    app.use(express.json()); //bara express.json() middleware
};
// Middleware för att verifiera JWT-token
export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};


export default { middleWare };

module.exports = {
    validateMenuItem
};

