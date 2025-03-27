const cartSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        coffee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coffee', required: true },
        quantity: { type: Number, required: true }
    }]
});

export const Cart = mongoose.model('Cart', cartSchema);