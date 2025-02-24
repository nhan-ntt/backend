import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import roleModel from "../models/role.model.js";
import { JWT_SECRET, JWT_EXPIRATION_TIME } from "../config/environments.js";

const register = async (req, res) => {
    // Save User to Database
    try {
        let role = req.body.role;
        if (role === "admin") {
            return res.status(400).send("You are not allowed to register as admin");
        }
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: req.body.role,
        });
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).populate("role");

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password!",
            });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            algorithm: "HS256",
            allowInsecureKeySizes: true,
            expiresIn: JWT_EXPIRATION_TIME,
        });

        // Ensure req.session is defined before setting the token
        if (!req.session) {
            req.session = {};
        }
        req.session.token = token;

        return res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.role,
            accessToken: token,
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({
            message: "You've been signed out!",
        });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

export default { login, register, logout };
