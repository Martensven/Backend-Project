import express from 'express';
import { User } from '../models/users.js';

const router = express.Router();

// Hämta användare
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
});

// Skapa en ny användare (POST)
router.post('/register', async (req, res) => {
    try {

        const { first_name, last_name, email, street, zip_code, city, password } = req.body;

        if (!first_name || !last_name || !email || !street || !zip_code || !city || !password) {

            return res.status(400).json({ error: 'All fields are required' });
        }

        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Uppdatera en användare (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

<
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }


        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// Ta bort en användare (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

export default router;

