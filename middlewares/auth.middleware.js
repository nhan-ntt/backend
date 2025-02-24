import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/environments.js";

const authenticateToken = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }
    
    const headerParts = authHeader.split(' ');
    if (headerParts.length !== 2) {
        return res.status(400).json({ success: false, message: 'Invalid Authorization header' });
    }

    const token = headerParts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Invalid Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

export { authenticateToken};
