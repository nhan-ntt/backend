import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/environments.js";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "No token provided" 
            });
        }

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Unauthorized" 
                });
            }

            try {
                // Find the user and populate the role field
                const user = await User.findById(decoded.id).populate("role");
                
                if (!user) {
                    return res.status(404).json({ 
                        success: false, 
                        message: "User not found" 
                    });
                }
                
                // Set both user and userInfo to maintain compatibility
                req.user = user;
                req.userInfo = user;  // This ensures req.userInfo is defined
                
                next();
            } catch (error) {
                console.error("Error in auth middleware:", error);
                return res.status(500).json({ 
                    success: false, 
                    message: "Server error" 
                });
            }
        });
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};
