import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        sparse: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    state: {
        type: String,
    },
    district: {
        type: String,
    },
    city: {
        type: String,
    },
    address: {
        type: String,
    },
}, {
    timestamps: true // Move this to the schema options
});

const User = mongoose.model("User", userSchema);
export default User;
