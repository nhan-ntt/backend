import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
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
    role: {
        type: String,
        enum: ["admin", "mobile user", "expert", "manager", "field expert"],
        required: true,
    },
}, {
    timestamps: true // Move this to the schema options
});

const User = mongoose.model("User", userSchema);
export default User;
