import express from 'express';
import { connectDB } from './config/db.js';
import { User } from './models/users.js';
// import middleWare from './middlewares/middleware.js';
import itemRoutes from './routes/item-route.js';

const app = express();
const PORT = 4321;


await connectDB();


app.use(express.json()); 
// app.use(middleWare);


app.use('/items', itemRoutes);


app.get('/', (req, res) => {
    res.send('Hello world!');
});


app.post('/user', async (req, res) => {
    try {
        const { name, age, email } = req.body;
        const newUser = new User({
            name,
            age,
            email
        });
        await newUser.save();
        res.status(201).json({ message: 'User added!', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});