import { Router } from "express";
import success from "../utils/response-utils.js";
import CommonError from "../utils/error.js";
import ReportService from "../services/report.service.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { hasRole } from "../middlewares/role.middleware.js";

const api = Router();

api.post("/report", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role != "admin" &&
            req.userInfo.role.role != "user"
        ) {
            const report = await ReportService.createReport({
                report: {
                    ...req.body.data,
                    userId: req.userInfo._id.toString(),
                },
            });
            return res.json(success(report));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/report/update-report", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role != "admin" &&
            req.userInfo.role.role != "user"
        ) {
            const report = await ReportService.updateReport({
                ...req.body.data,
                userId: req.userInfo._id,
            });
            return res.json(success(report));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/report/remove-report", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role != "admin" &&
            req.userInfo.role.role != "user"
        ) {
            const report = await ReportService.removeReport({
                ...req.body.data,
            });
            return res.json(success(report));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/report/get-report-by-id", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role != "admin" &&
            req.userInfo.role.role != "user"
        ) {
            const report = await ReportService.getReportById({
                ...req.body.data,
            });
            return res.json(success(report));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
api.post("/report/get-report", authenticateToken, async (req, res) => {
    try {
        if (
            req.userInfo.role.role != "admin" &&
            req.userInfo.role.role != "user"
        ) {
            const report = await ReportService.getReports({
                ...req.body.data,
            });
            return res.json(success(report));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});
export default api;
