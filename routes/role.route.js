import express from "express";
import roleService from "../services/role.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import CommonError from "../utils/error.js";
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.json(roles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.post("/initialize", async (req, res) => {
    try {
        const roles = await roleService.createDefaultRoles();
        res.status(201).json({ message: "Roles created successfully", roles });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post("/get-roles", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "admin") {
            const roles = await roleService.getRoles();
            return res.json(success(roles));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

export default router;
