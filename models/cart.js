import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        quantity: { type: Number, required: true },
    }]
});

export const Cart = mongoose.model('Cart', cartSchema);