import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
}, { timestamps: true, minimize: false })

export const User = mongoose.model('User', userSchema)