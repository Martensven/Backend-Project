import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    street: { type: String, required: true },
    zip_code: { type: String, required: true },
    city: { type: String, required: true },
    password: { type: String, required: true, unique: true },
}, { timestamps: true, minimize: false })

export const User = mongoose.model('User', userSchema)