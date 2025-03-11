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

router.post("/register", authService.register);

router.post("/login", authService.login);


export default router;
