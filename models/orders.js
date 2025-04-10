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
    delivery_time: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    items: [{
        item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        title: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true }
    }],
    user_info: {
        first_name: { type: String, default: "Guest" },
        last_name: { type: String, default: "Guest" },
        email: { type: String, default: "Guest" },
        street: { type: String, default: "Guest" },
        zip_code: { type: String, default: "Guest" },
        city: { type: String, default: "Guest" }
    },
    created_at: { type: Date, default: Date.now }
});


export const Order = mongoose.model('Order', orderSchema);