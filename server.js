// // Imports
// import express from 'express';
// import session from 'express-session';
// import dotenv from 'dotenv';
// import { connectDB } from './config/db.js';
// import { middleWare } from './middlewares/middleware.js';
// import userRoutes from './routes/user-route.js';
// import itemRoutes from './routes/item-route.js';
// import orderRoutes from './routes/order-route.js';
// import cartRoutes from './routes/cart-route.js';
// import aboutRoutes from './routes/about-route.js';
// import cors from 'cors';
// import MongoStore from 'connect-mongo';


// dotenv.config();

// const app = express(); // Skapa app först!
// const PORT = 4321;

// // Middleware
// middleWare(app); // Använd middleware för att parsa JSON-data
// // app.use(middleWare());
// app.use(cors({
//     origin: 'http://localhost:5173', // Tillåt specifik frontend
//     credentials: true // Krävs för att skicka cookies över CORS
// }));
// app.use(express.json());
// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
// }));


// // Routes
// app.use('/user', userRoutes);
// app.use('/items', itemRoutes);
// app.use('/orders', orderRoutes);
// app.use('/cart', cartRoutes);
// app.use('/about', aboutRoutes);

// // Anslut till databasen och starta servern
// connectDB()
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Server is running on http://localhost:${PORT}`);
//         });
//     })
//     .catch(err => {
//         console.error('Failed to connect to database:', err);
//     });

// app.get('/', (req, res) => {
//     res.send('Hello world!')
// })

// Imports
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { middleWare } from './middlewares/middleware.js';
import userRoutes from './routes/user-route.js';
import itemRoutes from './routes/item-route.js';
import orderRoutes from './routes/order-route.js';
import cartRoutes from './routes/cart-route.js';
import aboutRoutes from './routes/about-route.js';
import cors from 'cors';
import MongoStore from 'connect-mongo'; // Importera MongoStore

dotenv.config();

const app = express(); // Skapa app först!
const PORT = 4321;

// Middleware
middleWare(app); // Använd middleware för att parsa JSON-data
app.use(cors({
    origin: 'http://localhost:5173', // Tillåt specifik frontend
    credentials: true // Krävs för att skicka cookies över CORS
}));
app.use(express.json());

// Konfigurera session med MongoStore
app.use(session({
    secret: 'your-secret-key', // Byt ut detta med en hemlig nyckel
    resave: false,              // Förhindrar att sessionen sparas om den inte ändras
    saveUninitialized: true,    // Sparar sessionen även om den inte har ändrats
    cookie: {
        secure: false,          // Sätt till true om du använder HTTPS
        httpOnly: true,         // Förhindrar åtkomst via JavaScript
        maxAge: 24 * 60 * 60 * 1000  // Maxlivslängd för sessionen (1 dag)
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,  // Din MongoDB-anslutningssträng (lägg till i .env-filen)
        ttl: 14 * 24 * 60 * 60 // Sessionens livslängd i sekunder (t.ex. 14 dagar)
    })
}));

// Routes
app.use('/user', userRoutes);
app.use('/items', itemRoutes);
app.use('/orders', orderRoutes);
app.use('/cart', cartRoutes);
app.use('/about', aboutRoutes);

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

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/session-test', (req, res) => {
    if (!req.session.views) {
        req.session.views = 1;
    } else {
        req.session.views++;
    }
    res.json({ views: req.session.views });
});