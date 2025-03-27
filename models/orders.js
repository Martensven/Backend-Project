const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    total_price: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    created_at: { type: Date, default: Date.now },
    items: [{
        coffee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coffee', required: true },
        quantity: { type: Number, required: true }
    }]
});

export const Order = mongoose.model('Order', orderSchema);