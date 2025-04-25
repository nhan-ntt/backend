import { Router } from "express";
import PlanService from "../services/plan.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";
import CommonError from "../utils/error.js";
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;


const api = Router();

api.post("/plan", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "user") {
            const plan = await PlanService.createPlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/plan/update-plan", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "user") {
            const plan = await PlanService.updatePlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/plan/remove-plan", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "user") {
            const plan = await PlanService.removePlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/plan/get-plan", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "user") {
            const plan = await PlanService.getPlan({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(plan));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});


export default api;
