import express from "express";
import PestService from "../services/pest.service.js";
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;
import CommonError from "../utils/error.js";

const router = express.Router();

router.post("/pest/create-default-pest", async (req, res) => {
    try {
        if (req.body.key == "this is password") {
            const pests = await PestService.createDefaultPest();
            return res.json(success(pests));
        } else {
            throw new Error("USER.PERMISSION_DENIED");
        }
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

router.post("/pest/get-pests", async (req, res) => {
    try {
        const pests = await PestService.getPests();
        return res.json(success(pests));
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});

router.post("/pest/get-pest-by-slug", async (req, res) => {
    try {
        const pest = await PestService.getPestBySlug(req.body.slug);
        return res.json(success(pest));
    } catch (error) {
        console.log("error", error);
        return CommonError(req, error, res);
    }
});


export default router;
