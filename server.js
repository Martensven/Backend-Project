//Imports
import express from 'express';
import { connectDB } from './config/db.js';
import { User } from './models/users.js';
import { middleWare } from './middlewares/middleware.js';

//
await connectDB();
await middleWare();

const app = express();
const PORT = 4321;

//Bara för att testa en bas-route
app.get('/', (req, res) => {
    res.send('Hello world!')
});

//Skapa användare
app.post('/user', async (req, res) => {
    try {
        const { name, age, email } = req.body
        const newUser = new User({
            name,
            age,
            email
        })
        await newUser.save()
        console.log(newUser);

        res.send('User added!')
    } catch (error) {
        res.send(error.message)
    }
})
//Uppdatera användare
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params; // Hämta ID från URL
        const updateData = req.body; // Hämta fält att uppdatera från request body

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//Ta bort användare
app.delete('/user/:id', async (req, res) => {
    const { id } = req.params
    await User.findByIdAndDelete(id)
    res.send('User deleted!')
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
