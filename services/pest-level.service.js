import PestLevel from "../models/pest-level.model.js";

const getAllPestLevel = async ({ offset, limit }) => {
    let pestLevel = await PestLevel.find({});
    return pestLevel;
};
const updateUrlPestLevel = async (body) => {
    if (body._id && body.url) {
        let pestLevel = await PestLevel.findByIdAndUpdate(
            body._id,
            {
                url: body.url,
            },
            {
                new: true,
            }
        );
        if (pestLevel) {
            return pestLevel;
        } else {
            throw new Error("PEST_LEVEL.POST.PEST_LEVEL_NOT_FOUND");
        }
    } else {
        throw new Error("PEST_LEVEL.POST.INVALID_PARAMS");
    }
};
const createDefaultPestLevel = async (body) => {
    let result = await PestLevel.find({}).countDocuments();
    if (result > 0) {
        throw new Error("PEST_LEVEL.POST.PEST_LEVEL_EXIST");
    } else {
        let listResult = [];
        for (let i = 1; i <= 3; i++) {
            let newPestLevel = new PestLevel({
                name: `Mức độ ${i}`,
                url: "https://i.imgur.com/i7zqmFx.png",
                code: i,
            });
            listResult.push(newPestLevel);
            await newPestLevel.save();
        }
        return listResult;
    }
};
const deleteAll = async () => {
    let result = await PestLevel.deleteMany({});
    return result;
};
export default {
    getAllPestLevel,
    updateUrlPestLevel,
    createDefaultPestLevel,
    deleteAll,
};
