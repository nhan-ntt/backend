import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { JWT_SECRET, JWT_EXPIRATION_TIME } from "../config/environments.js";

const register = async (req, res) => {
    // Save User to Database
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        //cant register as admin
        if (req.body.role === "admin") {
            return res.status(400).send("You are not allowed to register as admin");
        }

        //query by name
        const roleObject = await Role.findOne({role: req.body.role});


        const user = await User.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: roleObject,
            phone: req.body.phone || "",
            isActive: req.body.isActive || false,
            isBanned: false,
            state: req.body.state || "",
            district: req.body.district || "",
            city: req.body.city || "",
            address: req.body.address || ""
        });

        const populatedUser = await User.findById(user._id).populate('role');
        const userResponse = populatedUser.toObject();
        delete userResponse.password;


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
            role: user.role,
            accessToken: token,
            expiresIn: JWT_EXPIRATION_TIME,
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

export default { login, register };
