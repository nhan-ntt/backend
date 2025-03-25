import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { hasRole } from '../middlewares/role.middleware.js';
import UserService from '../services/user.service.js';
import responseUtils from "../utils/response-utils.js";
const { success } = responseUtils;

const router = Router();

router.post('/user/get-address-info', async (req, res) => {
    try {
        const { type, parentCode } = req.body;
        const addressInfo = await UserService.getAddressInfo({ type, parentCode });
        return res.json(success(addressInfo));
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    }
});


router.post("/user/get-user-by-id", authenticateToken, async (req, res) => {
    try {
        const user = await UserService.getUserById({ ...req.body });
        return res.json(success({ user }));
    } catch (err) {
        console.log(err);
        return CommonError(req, err, res);
    }
});

export default router;
