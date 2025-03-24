import Plan from "../models/plan.model.js";

const createPlan = async (plan) => {
    let { state, city, district, userId, address } = plan;
    if (state && city && district && userId) {
        let planInDb = await Plan.findOne({
            user: userId,
        });
        if (planInDb) {
            throw new Error("PLAN.POST.PLAN_EXISTED");
        } else {
            let newPlan = new Plan({
                ...plan,
                user: userId,
            });
            await newPlan.save();
            return newPlan;
        }
    } else {
        throw new Error("PLAN.POST.INVALID_PARAMS");
    }
};

const getPlan = async (plan) => {
    let { userId } = plan;
    if (userId) {
        let planInDb = await Plan.find({ user: userId });
        if (planInDb && planInDb?.length > 0) {
            return planInDb;
        } else {
            return [];
        }
    }
};
const removePlan = async (plan) => {
    if (plan._id) {
        let planInDb = await Plan.findById(plan._id);
        if (planInDb) {
            if (planInDb.user.toString() != plan.userId.toString()) {
                throw new Error("PLAN.DELETE.NOT_OWNER");
            } else {
                await planInDb.remove();
                return planInDb;
            }
        } else {
            throw new Error("PLAN.DELETE.NO_PLAN_FOUND");
        }
    } else {
        throw new Error("PLAN.DELETE.INVALID_PARAMS");
    }
};
const updatePlan = async (plan) => {
    if (plan._id) {
        let planInDb = await Plan.findById(plan._id);
        if (planInDb) {
            if (planInDb.user.toString() != plan.userId.toString()) {
                throw new Error("PLAN.PUT.NOT_OWNER");
            } else {
                let planUpdated = await Plan.updateOne(
                    {
                        _id: plan._id,
                    },
                    {
                        $set: {
                            ...plan,
                            city: plan.city ?? planInDb.city,
                            state: plan.state ?? planInDb.state,
                            district: plan.district ?? planInDb.district,
                        },
                    },
                    { new: true }
                );
                return planUpdated;
            }
        }
    } else {
        throw new Error("PLAN.UPDATE.INVALID_PARAMS");
    }
};
export default {
    removePlan,
    createPlan,
    getPlan,
    updatePlan,
};
