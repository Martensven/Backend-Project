import mongoose, { disconnect } from "mongoose";

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    total_price: { type: Number, required: true },
    original_price: { type: Number, required: false },
    discount_applied: { type: Number, required: false },
    applied_campaigns: [{
        name: { type: String },
        discount: { type: Number }, 
        type: { type: String }
    }],
    delivery_time: { type: String, required: true},
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    created_at: { type: Date, default: Date.now },
    items: [{
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        title: { type: String, requried: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }]
});

export const Order = mongoose.model('Order', orderSchema);