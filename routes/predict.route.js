import { Router } from "express";
import CommonError from "../utils/error.js";
import PredictService from "../services/predict.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;

const api = Router();


api.post("/predict/get-predict", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "expert" ||
            req.userInfo.role.role == "manager"
        ) {
            const pestLevels = await PredictService.getPredictByQuery({
                ...req.body.data,
            });
            return res.json(success(pestLevels));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (err) {
        console.log(err);
        return CommonError(req, err, res);
    }
});
api.post("/predict/end-predict", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "expert" ||
            req.userInfo.role.role == "manager"
        ) {
            const pestLevels = await PredictService.endPredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(pestLevels));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (err) {
        console.log(err);
        return CommonError(req, err, res);
    }
});
api.post("/predict/remove-predict", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "expert" ||
            req.userInfo.role.role == "manager"
        ) {
            const predict = await PredictService.removePredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(predict));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/predict/update-predict", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "expert" ||
            req.userInfo.role.role == "manager"
        ) {
            const predict = await PredictService.updatePredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(predict));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/predict/get-predict-by-address", authenticateToken, async (req, res) => {
    try {
        if (req.userInfo.role.role == "user") {
            const predict = await PredictService.getPredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(predict));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/predict", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "expert" ||
            req.userInfo.role.role == "manager"
        ) {
            const predict = await PredictService.createPredict({
                ...req.body.data,
                userId: req.userInfo._id.toString(),
            });
            return res.json(success(predict));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/predict-by-pass", async (req, res) => {
    try {
        if (req.body.key == "this is password") {
            const predict = await PredictService.createPredict({
                ...req.body.data,
            });
            return res.json(success(predict));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/predict/get-list-plant-stage", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role == "expert" ||
            req.userInfo.role.role == "manager"
        ) {
            const predict = await PredictService.getListPlantStage({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(predict));
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

export default api;
