import express from 'express';
import { About } from '../models/about.js';

const router = express.Router();

// Get all about entries
router.get('/', async (req, res) => {
  try {
    const aboutEntries = await About.find();
    res.json(aboutEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific about entry 
router.get('/:id', async (req, res) => {
  try {
    const aboutEntry = await About.findById(req.params.id);
    if (!aboutEntry) {
      return res.status(404).json({ message: 'About entry not found' });
    }
    res.json(aboutEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new about entry
router.post('/', async (req, res) => {
  const aboutEntry = new About({
    title: req.body.title,
    content: req.body.content
  });

  try {
    const newAboutEntry = await aboutEntry.save();
    res.status(201).json(newAboutEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an about entry
router.put('/:id', async (req, res) => {
  try {
    const aboutEntry = await About.findById(req.params.id);
    if (!aboutEntry) {
      return res.status(404).json({ message: 'About entry not found' });
    }

    if (req.body.title) aboutEntry.title = req.body.title;
    if (req.body.content) aboutEntry.content = req.body.content;

    const updatedAboutEntry = await aboutEntry.save();
    res.json(updatedAboutEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an about entry
router.delete('/:id', async (req, res) => {
  try {
    const aboutEntry = await About.findById(req.params.id);
    if (!aboutEntry) {
      return res.status(404).json({ message: 'About entry not found' });
    }

    await About.findByIdAndDelete(req.params.id);
    res.json({ message: 'About entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;