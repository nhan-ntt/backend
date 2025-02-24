import { Router } from "express";
import CommonError from "../utils/error.js";
import PestLevelService from "../services/pest-level.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;


const api = Router();
// api.post("/pestLevel", async (req, res) => {
//     try {
//         if (req.userInfo.role.role == "admin") {
//             const pestLevel = await PestLevelService.createPestLevel({
//                 ...req.body.data,
//             });
//             return res.json(success(pestLevel));
//         } else {
//             throw new Error("USER.PERMISSION_DENIED");
//         }
//     } catch (err) {
//         console.log(err);
//         return CommonError(req, err, res);
//     }
// });
api.get("/pestLevel/get-pest-level", authenticateToken, hasRole(["admin", "expert", "manager", "field expert"]), async (req, res) => {
    try {
            const pestLevels = await PestLevelService.getAllPestLevel({
                ...req.body.data,
            });
            return res.json(success(pestLevels));

    } catch (err) {
        console.log(err);
        return CommonError(req, err, res);
    }
});
api.post("/pestLevel/update-pest-level", authenticateToken, hasRole(["admin"]), async (req, res) => {
    try {
        if (req.userInfo.role.role == "admin") {
            const pestLevels = await PestLevelService.updateUrlPestLevel({
                ...req.body.data,
            });
            return res.json(success(pestLevels));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/pestLevel/create-default-pest-level", async (req, res) => {
    try {
        if (req.body.key == "this is password") {
            const pestLevels = await PestLevelService.createDefaultPestLevel();
            return res.json(success(pestLevels));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/pestLevel/delete-all", async (req, res) => {
    try {
        if (req.body.key == "this is password") {
            const pestLevels = await PestLevelService.deleteAll();
            return res.json(success(pestLevels));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

export default api;
