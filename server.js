// Imports
import express from 'express';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user-route.js';
import { middleWare } from './middlewares/middleware.js';

const app = express(); // Skapa app först!
const PORT = 4321;

app.use(express.json()); // Middleware för att tolka JSON

// Middleware
await middleWare();

// Routes
app.use('/user', userRoutes);

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

// Bara för att testa en bas-route
app.get('/', (req, res) => {
    res.send('Hello world!');
});

