import Pest from "../models/pest.model.js";

const pestData = [
    {
        name: "Sâu đục thân lúa hai chấm",
        slug: "walker",
        pestStages: [
            {
                name: "Trứng",
                value: 0,
                term: "egg",
            },
            {
                name: "Sâu non tuổi 1",
                value: 1,
                term: "instar_1",
            },
            {
                name: "Sâu non tuổi 2",
                value: 2,
                term: "instar_2",
            },
            {
                name: "Sâu non tuổi 3",
                value: 3,
                term: "instar_3",
            },
            {
                name: "Sâu non tuổi 4",
                value: 4,
                term: "instar_4",
            },
            {
                name: "Nhộng",
                value: 5,
                term: "pupa",
            },
            {
                name: "Trưởng thành",
                value: 6,
                term: "adult",
            },
        ],

        plantStages: [
            {
                name: "Gieo mạ",
                last: 10, // khoảng 10 ngày
                value: "a",
            },
            {
                name: "Đẻ nhánh",
                last: 30, // khoảng 30 ngày
                value: "b",
            },
            {
                name: "Làm đòng",
                last: 15, // khoảng 15 ngày
                value: "c",
            },
            {
                name: "Trổ bông",
                last: 7, // khoảng 7 ngày
                value: "d",
            },
            {
                name: "Chín",
                last: 30, // khoảng 30 ngày
                value: "e",
            },
            {
                name: "Không xác định",
                value: "x",
            },
        ],

        warnings: [
            // Gieo mạ
            { plant: "a", pest: 0, level: 1 },
            { plant: "a", pest: 1, level: 1 },
            { plant: "a", pest: 2, level: 1 },
            { plant: "a", pest: 3, level: 1 },
            { plant: "a", pest: 4, level: 1 },
            { plant: "a", pest: 5, level: 1 },
            { plant: "a", pest: 6, level: 1 },

            // Đẻ nhánh
            { plant: "b", pest: 0, level: 1 },
            { plant: "b", pest: 1, level: 1 },
            { plant: "b", pest: 2, level: 2 },
            { plant: "b", pest: 3, level: 3 },
            { plant: "b", pest: 4, level: 3 },
            { plant: "b", pest: 5, level: 1 },
            { plant: "b", pest: 6, level: 1 },

            // Làm đòng
            { plant: "c", pest: 0, level: 1 },
            { plant: "c", pest: 1, level: 2 },
            { plant: "c", pest: 2, level: 2 },
            { plant: "c", pest: 3, level: 3 },
            { plant: "c", pest: 4, level: 3 },
            { plant: "c", pest: 5, level: 1 },
            { plant: "c", pest: 6, level: 1 },

            // Trổ bông
            { plant: "d", pest: 0, level: 1 },
            { plant: "d", pest: 1, level: 2 },
            { plant: "d", pest: 2, level: 2 },
            { plant: "d", pest: 3, level: 3 },
            { plant: "d", pest: 4, level: 3 },
            { plant: "d", pest: 5, level: 1 },
            { plant: "d", pest: 6, level: 2 },

            // Chín
            { plant: "e", pest: 0, level: 1 },
            { plant: "e", pest: 1, level: 1 },
            { plant: "e", pest: 2, level: 2 },
            { plant: "e", pest: 3, level: 2 },
            { plant: "e", pest: 4, level: 3 },
            { plant: "e", pest: 5, level: 1 },
            { plant: "e", pest: 6, level: 1 },
        ],
    },

    {
        name: "Sâu keo mùa thu hại cây ngô",
        slug: "faw",

        pestStages: [
            {
                name: "Trứng",
                value: 0,
                term: "egg",
            },
            {
                name: "Sâu non tuổi 1",
                value: 1,
                term: "instar_1",
            },
            {
                name: "Sâu non tuổi 2",
                value: 2,
                term: "instar_2",
            },
            {
                name: "Sâu non tuổi 3",
                value: 3,
                term: "instar_3",
            },
            {
                name: "Sâu non tuổi 4",
                value: 4,
                term: "instar_4",
            },
            {
                name: "Sâu non tuổi 5",
                value: 5,
                term: "instar_5",
            },
            {
                name: "Sâu non tuổi 6",
                value: 6,
                term: "instar_6",
            },
            {
                name: "Nhộng",
                value: 7,
                term: "pupa",
            },
            {
                name: "Trưởng thành",
                value: 8,
                term: "adult",
            },
        ],

        plantStages: [
            {
                name: "Cây non",
                last: 42,
                value: "a",
            },
            {
                name: "Cây con",
                last: 42,
                value: "b",
            },
            {
                name: "Cây bắp",
                last: 42,
                value: "c",
            },
            {
                name: "Không xác định",
                value: "x",
            },
        ],

        warnings: [
            { plant: "a", pest: 0, level: 1 },
            { plant: "a", pest: 1, level: 2 },
            { plant: "a", pest: 2, level: 2 },
            { plant: "a", pest: 3, level: 2 },
            { plant: "a", pest: 4, level: 3 },
            { plant: "a", pest: 5, level: 3 },
            { plant: "a", pest: 6, level: 3 },
            { plant: "a", pest: 7, level: 1 },
            { plant: "a", pest: 8, level: 1 },
            { plant: "b", pest: 0, level: 1 },
            { plant: "b", pest: 1, level: 2 },
            { plant: "b", pest: 2, level: 2 },
            { plant: "b", pest: 3, level: 2 },
            { plant: "b", pest: 4, level: 3 },
            { plant: "b", pest: 5, level: 3 },
            { plant: "b", pest: 6, level: 3 },
            { plant: "b", pest: 7, level: 1 },
            { plant: "b", pest: 8, level: 1 },
            { plant: "c", pest: 0, level: 1 },
            { plant: "c", pest: 1, level: 1 },
            { plant: "c", pest: 2, level: 1 },
            { plant: "c", pest: 3, level: 1 },
            { plant: "c", pest: 4, level: 1 },
            { plant: "c", pest: 5, level: 1 },
            { plant: "c", pest: 6, level: 1 },
            { plant: "c", pest: 7, level: 1 },
            { plant: "c", pest: 8, level: 1 },
        ],
    },
];

const createDefaultPest = async () => {
    try {
        const existingPestCount = await Pest.countDocuments();
        if (existingPestCount > 0) {
            throw new Error("PEST.POST.PEST_EXIST");
        }

        const createdPests = await Pest.insertMany(pestData);
        return createdPests;
    } catch (error) {
        throw new Error("PEST.POST.CREATION_FAILED");
    }
}

const getPests = async () => {
    try {
        const pests = await Pest.find();
        if (!pests || pests.length === 0) {
            throw new Error("PEST.GET.PEST_NOT_FOUND");
        }
        return pests;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getPestBySlug = async (slug) => {
    try {
        const pest = await Pest.findOne({ slug });
        if (!pest) {
            throw new Error("PEST.GET.PEST_NOT_FOUND");
        }
        return pest;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getPestStageBySlug = async ( slug ) => {
    const Pest = PestService.getPestBySlug(slug);
    const pestStages = Pest.pestStages;
    console.log({
        "pestStages": pestStages,
        "type": typeof pestStages}
    )
    return pestStages;
}


const getPlantStageBySlug = async ( slug ) => {
    const Pest = PestService.getPestBySlug(slug);
    const plantStages = Pest.plantStages;
    return plantStages;
}

const getWarningBySlug = async ( slug ) => {
    const Pest = PestService.getPestBySlug(slug);
    const warnings = Pest.warnings;
    return warnings;
}


export default {
    createDefaultPest,
    getPests,
    getPestBySlug,
    getPlantStageBySlug, 
    getPestStageBySlug,
    getWarningBySlug
};