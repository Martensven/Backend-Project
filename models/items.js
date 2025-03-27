const itemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { String, required: true },
    description: { String, required: true },
    price: { type: Number, required: true },
});

export const Item = mongoose.model('Coffee', itemSchema);