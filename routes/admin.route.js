import express from "express";
import adminService from "../services/admin.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/web-app/get-user", authenticateToken, hasRole(['admin']), async (req, res) => {
// router.get("/users", async (req, res) => {
    try {
        const { paginationProps, queryProps } = req.body;
        const users = await adminService.getAllUsers({ 
            paginationProps: paginationProps || {}, 
            queryProps: queryProps || {} 
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/users", authenticateToken, hasRole(["admin"]), async (req, res) => {
// router.post("/users", async (req, res) => {
    try {
        const user = await adminService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put("/users/:id", authenticateToken, hasRole(["admin"]), async (req, res) => {
// router.put("/users/:id", async (req, res) => {
    try {
        const user = await adminService.updateUser(req.params.id, req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.delete("/users/:id", authenticateToken, hasRole(["admin"]), async (req, res) => {
// router.delete("/users/:id", async (req, res) => {

    try {
        const deletedUser = await adminService.deleteUser(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
