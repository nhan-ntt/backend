import express from "express";
import roleService from "../services/role.service.js";

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

export default router;
