import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    // createdAt kan vara bra att ha
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Item = mongoose.model('Item', itemSchema);