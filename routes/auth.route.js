import express from "express";
import authService from "../services/auth.service.js";

const router = express.Router();

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
    );
    next();
});

router.post("/auth/register", authService.register);

router.post("/auth/login", authService.login);


export default router;
