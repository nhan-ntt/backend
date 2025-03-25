import express from "express";
import adminService from "../services/admin.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";
import CommonError from "../utils/error.js";
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;

const router = express.Router();

router.post("/create-account-admin", async (req, res) => {
    try {
        if (req.body.key === "this is key to create admin") {
            return await adminService.createUser(req, res);
        } else {
            return res.status(400).json({ message: "Invalid key" });
        }
    } catch (error) {
        console.error("Admin creation error:", error);
        return res.status(400).json({ message: error.message });
    }
});

router.post("/get-user", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "admin") {
            const user = await adminService.getAllUsers({
                paginationProps: req.body.paginationProps || {},
                queryProps: req.body.queryProps || {},
            });
            return res.json(success(user));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});


router.post("/web-app/get-user", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role != "admin" &&
            req.userInfo.role.role != "user"
        ) {
            const user = await adminService.getUserMobile({ ...req.body });
            return res.json(success(user));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

router.post("/create-user-web-app", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "admin") {
            console.log("create web app", req.body);
            const user = await adminService.createUserWebApp({
                ...req.body,
            });
            return res.json(success(user));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

router.post("/update-user", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "admin" ||
            req.body?._id == req.userInfo._id
        ) {
            const user = await adminService.updateUser({
                ...req.body,
            });
            return res.json(success(user));
        } else {
            return CommonError(req, "USER.PERMISSION_DENIED", res);
        }
    } catch (err) {
        console.log("error", err);
        return CommonError(req, err, res);
    }
});

router.post("/update-user-bypass", async (req, res) => {
    try {
        // Log for debugging
        console.log("Update user bypass request:", req.body);
        
        // Check if data is provided
        if (!req.body) {
            return CommonError(req, new Error("USER.UPDATE.MISSING_DATA"), res);
        }
        
        // Update user with all provided fields
        const user = await adminService.updateUser({
            ...req.body
        });
        
        return res.json(success(user));
    } catch (err) {
        console.log("Update user bypass error:", err);
        return CommonError(req, err, res);
    }
});

router.post("/remove-user", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "admin") {
            const user = await adminService.deleteUser({
                id: req.body.id,
            });
            return res.json(success({ user }));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (err) {
        console.log(err);
        return CommonError(req, err, res);
    }
});

export default router;
