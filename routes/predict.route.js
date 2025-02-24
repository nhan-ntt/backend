import { Router } from "express";
import success from "../utils/response-utils.js";
import CommonError from "../utils/error.js";
// import { CheckAuthTest } from "../../middlewares/auth.mid";
import PredictService from "../services/predict.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";

const api = Router();

api.get("/get-predict", authenticateToken, hasRole(["expert", "manager"]), async (req, res) => {
        try {
            const pestLevels = await PredictService.getPredictByQuery({
                ...req.body.data,
            });
            return res.json(success(pestLevels));
        } catch (err) {
            console.log(err);
            return CommonError(req, err, res);
        }
    }
);

api.post("/predict/end-predict", authenticateToken, hasRole(["expert", "manager"]), async (req, res) => {
    try {
 
            const pestLevels = await PredictService.endPredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(pestLevels));

    } catch (err) {
        console.log(err);
        return CommonError(req, err, res);
    }
});
api.post("/predict/remove-predict", authenticateToken, hasRole(["expert", "manager"]), async (req, res) => {
    try {

            const predict = await PredictService.removePredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(predict));
        
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});


api.post("/predict/update-predict", authenticateToken, hasRole(["expert", "manager"]), async (req, res) => {
    try {

            const predict = await PredictService.updatePredict({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(predict));
        
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});


api.post(
    "/predict/get-predict-by-address",
    authenticateToken, hasRole(["user"]),
    async (req, res) => {
        try {

                const predict = await PredictService.getPredict({
                    ...req.body.data,
                    userId: req.userInfo._id,
                });
                return res.json(success(predict));
            
        } catch (error) {
            console.log("error", error);
            return CommonError(req, error, res);
        }
    }
);
api.post("/predict", authenticateToken, hasRole(["expert", "manager"]), async (req, res) => {
    try {

            const predict = await PredictService.createPredict({
                ...req.body.data,
                userId: req.userInfo._id.toString(),
            });
            return res.json(success(predict));
    
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/predict-by-pass", async (req, res) => {
    try {
            const predict = await PredictService.createPredict({
                ...req.body.data,
            });
            return res.json(success(predict));
        
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.get(
    "/predict/get-list-plant-stage",
    authenticateToken, hasRole(["expert", "manager"]),
    async (req, res) => {
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
    }
);
export default api;
