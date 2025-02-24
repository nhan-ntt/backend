import { Router } from "express";
import success from "../utils/response-utils.js";
import CommonError from "../utils/error.js";
import PlanService from "../services/plan.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";

const api = Router();

// use hasRole(["user"]) middleware to check if the user has the role of "user"
api.get("/plan", authenticateToken, hasRole(["user"]), async (req, res) => {
    try {
        const plan = await PlanService.createPlan({
            ...req.body.data,
            userId: req.userInfo._id,
        });
        return res.json(success(plan));
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

api.post(
    "/plan/update-plan",
    authenticateToken,
    hasRole(["user"]),
    async (req, res) => {
        try {
            const plan = await PlanService.updatePlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } catch (error) {
            console.log("error", error);
            return CommonError(req, error, res);
        }
    }
);
api.post(
    "/plan/remove-plan",
    authenticateToken,
    hasRole(["user"]),
    async (req, res) => {
        try {
            const plan = await PlanService.removePlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } catch (error) {
            console.log("error", error);
            return CommonError(req, error, res);
        }
    }
);
api.post(
    "/plan/get-plan",
    authenticateToken,
    hasRole(["user"]),
    async (req, res) => {
        try {
            const plan = await PlanService.getPlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } catch (error) {
            console.log("error", error);
            return CommonError(req, error, res);
        }
    }
);

export default api;
