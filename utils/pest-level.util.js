import { promisify } from "util";

import Report from "../models/report.model.js";

import { exec } from "child_process";

export const LIST_PEST_LEVEL = [
    {
        name: "Trứng",
        value: 0,
        term: "egg",
    },
    {
        name: "Sâu non 1",
        value: 1,
        term: "instar_1",
    },
    {
        name: "Sâu non 2",
        value: 2,
        term: "instar_2",
    },
    {
        name: "Sâu non 3",
        value: 3,
        term: "instar_3",
    },
    {
        name: "Sâu non 4",
        value: 4,
        term: "instar_4",
    },
    {
        name: "Sâu non 5",
        value: 5,
        term: "instar_5",
    },
    {
        name: "Sâu non 6",
        value: 6,
        term: "instar_6",
    },
    {
        name: "Nhộng",
        value: 7,
        term: "pupal",
    },
    {
        name: "Trưởng thành",
        value: 8,
        term: "adult",
    },
];

export const LIST_PLANT = [
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
];

export const WARNING_CLASSIFICATION = [
    {
        plant: "a",
        pest: 0,
        level: 1,
    },
    {
        plant: "a",
        pest: 1,
        level: 2,
    },
    {
        plant: "a",
        pest: 2,
        level: 2,
    },
    {
        plant: "a",
        pest: 3,
        level: 2,
    },
    {
        plant: "a",
        pest: 4,
        level: 3,
    },
    {
        plant: "a",
        pest: 5,
        level: 3,
    },
    {
        plant: "a",
        pest: 6,
        level: 3,
    },
    {
        plant: "a",
        pest: 7,
        level: 1,
    },
    {
        plant: "a",
        pest: 8,
        level: 1,
    },
    {
        plant: "b",
        pest: 0,
        level: 1,
    },
    {
        plant: "b",
        pest: 1,
        level: 2,
    },
    {
        plant: "b",
        pest: 2,
        level: 2,
    },
    {
        plant: "b",
        pest: 3,
        level: 2,
    },
    {
        plant: "b",
        pest: 4,
        level: 3,
    },
    {
        plant: "b",
        pest: 5,
        level: 3,
    },
    {
        plant: "b",
        pest: 6,
        level: 3,
    },
    {
        plant: "b",
        pest: 7,
        level: 1,
    },
    {
        plant: "b",
        pest: 8,
        level: 1,
    },
    {
        plant: "c",
        pest: 0,
        level: 1,
    },
    {
        plant: "c",
        pest: 1,
        level: 1,
    },
    {
        plant: "c",
        pest: 2,
        level: 1,
    },
    {
        plant: "c",
        pest: 3,
        level: 1,
    },
    {
        plant: "c",
        pest: 4,
        level: 1,
    },
    {
        plant: "c",
        pest: 5,
        level: 1,
    },
    {
        plant: "c",
        pest: 6,
        level: 1,
    },
    {
        plant: "c",
        pest: 7,
        level: 1,
    },
    {
        plant: "c",
        pest: 8,
        level: 1,
    },
];

export const getWarningLevel = (plant, pest) => {
    if (plant === "x") return 0;

    const warning = WARNING_CLASSIFICATION.find(
        (warning) => warning.plant === plant && warning.pest === pest
    );

    return warning ? warning.level : null;
};

const executePestCommand = async (location, date, age) => {
    let varCommand =
        "cd ./utils/FAWPredict && python3 FAWPredict.py" +
        " --mode lookup" +
        " --location " +
        location +
        " --date " +
        date +
        " --age " +
        age;


    console.log("command of pest", varCommand)

    // let varCommand =
    //     "cd ./utils/riceLeaffolder && python3 main.py" +
    //     " --mode lookup" +
    //     " --location " +
    //     location +
    //     " --date " +
    //     date +
    //     " --age " +
    //     age;

    const execPromise = promisify(exec);
    const { stdout, stderr } = await execPromise(varCommand);

    let stdOutput = stdout.split(/\s+/);

    let pestCommandResult = stdOutput
        .reduce((acc, item, index) => {
            if (LIST_PEST_LEVEL.some((level) => level.term === item)) {
                const level = LIST_PEST_LEVEL.find(
                    (level) => level.term === item
                );
                const nextItem = stdOutput[index + 1];
                const pair = [level.value, nextItem];

                acc.push(pair);
            }
            return acc;
        }, [])
        .flat();

    return pestCommandResult;
};

// execute PestCommand python script
const getPestData = async (state, lastReport) => {
    // Convert state
    let normalizeState = state
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, "-") // Replace all whitespace characters with hyphens
        .normalize("NFD") // Normalize to decomposed form to separate diacritical marks
        .replace(/[\u0300-\u036f]/g, "") // Remove all diacritical marks
        .replace(/[^\w-]*-+[^\w-]*/g, "-") // Replace any sequence of non-word characters that includes hyphens with a single hyphen
        .replace(/[^\w-]+/g, ""); // Remove all non-word characters except hyphens

    let stateArr = normalizeState.split("-");

    if (stateArr[0] === "tinh") {
        stateArr.shift();
        normalizeState = stateArr.join("-");
    } else if (stateArr[0] === "thanh" && stateArr[1] === "pho") {
        stateArr.shift();
        stateArr.shift();
        normalizeState = stateArr.join("-");
    } else throw new Error("Cant not convert state name!");

    let pestData = await executePestCommand(
        normalizeState,
        lastReport.updatedAt.toISOString().slice(0, 10),
        lastReport.pestLevel
    );

    if (pestData.length < 2) {
        return pestData;
    }

    const lastAgeCurrentPestData = pestData[pestData.length - 2];
    const lastDayCurrentPestData = pestData[pestData.length - 1];

    function isValidDateFormat(dateString) {
        let date = new Date(dateString);
        const today = new Date();
        const differenceInDays = (date - today) / (1000 * 60 * 60 * 24);
        return (
            date instanceof Date &&
            !isNaN(date) &&
            date.toISOString().slice(0, 10) === dateString &&
            differenceInDays < 14
        );
    }

    if (!isValidDateFormat(lastDayCurrentPestData)) {
        return pestData;
    }

    let pestData_2 = await executePestCommand(
        normalizeState,
        lastDayCurrentPestData,
        lastAgeCurrentPestData
    );

    if (pestData_2.length < 2) {
        return pestData;
    }

    return [...pestData, ...pestData_2];
};

const cleanPastPestData = (inputData) => {
    let tempData = inputData.map((item) => {
        if (typeof item === "string") {
            return new Date(item);
        }
        return item;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resData = [];

    for (let i = tempData.length - 1; i >= 0; i--) {
        const element = tempData[i];

        if (i % 2 === 1) {
            if (element < today) break;
        }

        resData.push(element);
    }

    resData.reverse();

    let result = [];

    for (let i = 0; i < resData.length; i += 2) {
        result.push({ level: resData[i], date: resData[i + 1] });
    }

    return result;
};

const calculatePestLevel = (pestData, curDate) => {
    let result =
        (pestData[0].level + LIST_PEST_LEVEL.length - 1) %
        LIST_PEST_LEVEL.length;

    for (let i = 0; i < pestData.length; i++) {
        if (pestData[i].date <= curDate) result = pestData[i].level;
    }

    return result;
};

export const calculatePlantLevel = (startDate, curDate) => {
    const milestone_1 = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + LIST_PLANT[0].last
    );
    const milestone_2 = new Date(
        milestone_1.getFullYear(),
        milestone_1.getMonth(),
        milestone_1.getDate() + LIST_PLANT[1].last
    );
    const milestone_3 = new Date(
        milestone_2.getFullYear(),
        milestone_2.getMonth(),
        milestone_2.getDate() + LIST_PLANT[2].last
    );

    if (startDate <= curDate && curDate < milestone_1) return "a";
    if (milestone_1 <= curDate && curDate < milestone_2) return "b";
    if (milestone_2 <= curDate && curDate < milestone_3) return "c";

    return "x";
};

export const getWarningForecast = async (info) => {
    try {
        const { state, city, district, startTime, numOfDaysForecast } = info;

        const lastReport = await Report.findOne(
            { state, city, district },
            {},
            { sort: { updatedAt: -1 } },
            function (err) {
                if (err) throw err;
            }
        );

        if (!lastReport) {
            throw new Error("There are no reports for this location!");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timeDiff = Math.abs(
            today.getTime() - new Date(lastReport.updatedAt).getTime()
        );
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff > 60) {
            throw new Error(
                "The gap between last report at this location and today is more than 60 days!"
            );
        }

        const tempData = await getPestData(state, lastReport);
        const pestData = cleanPastPestData(tempData);

        if (pestData.length < 1) {
            throw new Error("There are no suitable data for this forecast!");
        }

        const result = [];

        for (let i = 0; i < numOfDaysForecast; i++) {
            const curDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + i
            );

            const curPlantLevel = calculatePlantLevel(startTime, curDate);
            const curPestLevel = calculatePestLevel(pestData, curDate);

            result.push({
                date: curDate,
                pestLevel: curPestLevel,
                plantLevel: curPlantLevel,
                warningLevel: getWarningLevel(curPlantLevel, curPestLevel),
            });
        }

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const calculateEndTimeSeason = (startDate) => {
    return new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() +
            LIST_PLANT[0].last +
            LIST_PLANT[1].last +
            LIST_PLANT[2].last
    );
};
