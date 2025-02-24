// crud user

import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const getAllUsers = async () => {
    return await User.find();
};

const createUser = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    return newUser;
};

const updateUser = async (id, data) => {
    if (data.role === "admin") {
        throw new Error("You cannot update user role to admin");
    }
    return await User.findByIdAndUpdate(id, data, { new: true });
};

const deleteUser = async (id) => {
    await User.findByIdAndDelete(id);
    return "User deleted successfully"; 
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export default {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
};
