import PestLevel from "../models/pest-level.model.js";
import Predict from "../models/predict.model.js";

import {
    LIST_PLANT,
    LIST_PEST_LEVEL,
    calculateEndTimeSeason,
    getWarningForecast,
} from "../utils/pest-level.util.js";

import { customQuery, parsePaginationOption } from "../utils/search.js";

import mongoose from "mongoose";

const getPredictByQuery = async ({ paginationProps, queryProps }) => {
    const paginationOption = parsePaginationOption(paginationProps);
    let queryPropsFormat = customQuery(queryProps, true);
    const defaultSortField = "createdAt";
    const sortOption = {
        [paginationProps.sortBy
            ? paginationProps.sortBy === ""
                ? defaultSortField
                : paginationProps.sortBy
            : defaultSortField]: paginationProps.sortType === "asc" ? 1 : -1,
    };
    const { page, limit } = paginationOption;
    const skipOptions = limit * (page - 1);
    let aggr = [...queryPropsFormat];
    let currentPage = [
        {
            $skip: skipOptions,
        },
        {
            $limit: limit,
        },
        {
            $sort: sortOption,
        },
    ];
    if (queryProps.pestLevelId) {
        aggr.unshift({
            $match: {
                currentPestLevel: new mongoose.Types.ObjectId(
                    queryProps.pestLevelId
                ),
            },
        });
    }
    console.log("aggr", aggr);
    let predicts = await Predict.aggregate([...aggr, ...currentPage]);
    if (predicts && predicts?.length > 0) {
        await Predict.populate(predicts, {
            path: "currentPestLevel",
        });
        let count = await Predict.aggregate([...aggr, { $count: "id" }]);
        let formatPredicts = predicts.map((predict) => {
            return {
                ...JSON.parse(JSON.stringify(predict)),
                temperature: "22 C",
                humidity: "70%",
                rainfall: "1.9 mm",
            };
        });
        return {
            data: formatPredicts,
            total: count[0].id,
        };
    } else {
        return {
            data: [],
            total: 0,
        };
    }
};


const getPredict = async (data) => {
    if (data.state && data.city && data.district) {
        let predict = await Predict.findOne({
            state: data.state,
            city: data.city,
            district: data.district,
            isFinish: false,
        }).populate("user currentPestLevel lastPestLevel");
        if (predict) {
            return {
                ...JSON.parse(JSON.stringify(predict)),
                temperature: "22 C",
                humidity: "70%",
                rainfall: "1.9 mm",
            };
        } else {
            return null;
        }
    } else {
        throw new Error("PREDICT.POST.INVALID_PARAMS");
    }
};
const removePredict = async (predict) => {
    if (predict._id) {
        let predictInDb = await Predict.findById(predict._id);
        if (predictInDb) {
            if (predictInDb.user.toString() != predict.userId.toString()) {
                throw new Error("PREDICT_MOBILE.DELETE.NOT_OWNER");
            } else {
                await predictInDb.remove();
                return predictInDb;
            }
        } else {
            throw new Error("PREDICT_MOBILE.DELETE.NO_PREDICT_FOUND");
        }
    } else {
        throw new Error("PREDICT_MOBILE.DELETE.INVALID_PARAMS");
    }
};
const createPredict = async (predict) => {
    let { state, city, district, timeStart, pestLevelId, userId, lastTimeEnd } =
        predict;
    if (state && city && district && timeStart && userId) {
        let predictDb = await Predict.findOne({
            state: state,
            city: city,
            district: district,
            isFinish: false,
        });
        if (predictDb) {
            throw new Error("PREDICT.POST.PREDICT_EXISTED");
        } else {
            const startDate = new Date(timeStart);
            const today = new Date();

            if ((today - startDate) / (1000 * 60 * 60 * 24) < 0) {
                throw new Error("PREDICT.POST.START_TIME_EXCEEDS_CURRENT_DATE");
            }

            const forecastResult = await getWarningForecast({
                state,
                city,
                district,
                startTime: startDate,
                numOfDaysForecast: 14,
            });

            const newLastRun = new Date();
            const newNextRun = new Date(
                newLastRun.getFullYear(),
                newLastRun.getMonth(),
                newLastRun.getDate() + 1
            );

            const currentPestLevel = await PestLevel.findOne({
                code: forecastResult[0].warningLevel,
            });

            const pestStage = LIST_PEST_LEVEL.find(
                (per) => per.value === forecastResult[0].pestLevel
            ).name;
            const plantStage = LIST_PLANT.find(
                (per) => per.value === forecastResult[0].plantLevel
            ).name;

            let newPredict = new Predict({
                ...predict,
                lastPestLevel: pestLevelId ? pestLevelId : null,
                user: userId,
                lastTimeEnd: lastTimeEnd ? new Date(lastTimeEnd) : null,
                timeStart: startDate,
                timeEnd: calculateEndTimeSeason(startDate),
                pestStage,
                plantStage,
                currentPestLevel: currentPestLevel._id,
                warningForecast: forecastResult,
                isFinish: false,
                lastRun: newLastRun,
                nextRun: newNextRun,
            });
            let sPredict = await newPredict.save();
            return sPredict;
        }
    } else {
        throw new Error("PREDICT.POST.INVALID_PARAMS");
    }
};
const endPredict = async (predict) => {
    if (predict._id) {
        let predictInDb = await Predict.findById(predict._id);
        if (predictInDb) {
            if (predictInDb.user.toString() != predict.userId.toString()) {
                throw new Error("PREDICT_MOBILE.UPDATE.NOT_OWNER");
            } else {
                let result = await Predict.findByIdAndUpdate(
                    predict._id,
                    {
                        isFinish: true,
                        lastTimeEnd: new Date(),
                    },
                    {
                        new: true,
                    }
                );

                return result;
            }
        }
    } else {
        throw new Error("PREDICT_MOBILE.UPDATE.INVALID_PARAMS");
    }
};
const updatePredict = async (predict) => {
    let { state, city, district, timeStart } = predict;

    if (predict._id) {
        let predictInDb = await Predict.findById(predict._id);
        if (predictInDb) {
            if (
                predictInDb.user.toString() != predict.userId.toString() &&
                predict.userId !== "server-auto-update-1412" // Temporary signature for IFawcast cron job auto update predict when update report
            ) {
                throw new Error("PREDICT_MOBILE.UPDATE.NOT_OWNER");
            } else {
                const startDate = new Date(timeStart);
                const today = new Date();

                if ((today - startDate) / (1000 * 60 * 60 * 24) < 0) {
                    throw new Error(
                        "PREDICT.POST.START_TIME_EXCEEDS_CURRENT_DATE"
                    );
                }

                const forecastResult = await getWarningForecast({
                    state,
                    city,
                    district,
                    startTime: startDate,
                    numOfDaysForecast: 14,
                });

                const newLastRun = new Date();
                const newNextRun = new Date(
                    newLastRun.getFullYear(),
                    newLastRun.getMonth(),
                    newLastRun.getDate() + 1
                );

                const currentPestLevel = await PestLevel.findOne({
                    code: forecastResult[0].warningLevel,
                });

                const pestStage = LIST_PEST_LEVEL.find(
                    (per) => per.value === forecastResult[0].pestLevel
                ).name;
                const plantStage = LIST_PLANT.find(
                    (per) => per.value === forecastResult[0].plantLevel
                ).name;

                let sPredict = await Predict.findByIdAndUpdate(
                    predict._id,
                    {
                        ...predict,
                        timeEnd: calculateEndTimeSeason(startDate),
                        pestStage,
                        plantStage,
                        currentPestLevel: currentPestLevel._id,
                        warningForecast: forecastResult,
                        lastRun: newLastRun,
                        nextRun: newNextRun,
                    },
                    {
                        new: true,
                    }
                );
                return sPredict;
            }
        } else {
            throw new Error("PREDICT_MOBILE.UPDATE.NO_PREDICT_FOUND");
        }
    } else {
        throw new Error("PREDICT_MOBILE.UPDATE.INVALID_PARAMS");
    }
};
const getListPlantStage = () => {
    return LIST_PLANT;
};
export default {
    getPredictByQuery,
    createPredict,
    getPredict,
    removePredict,
    updatePredict,
    getListPlantStage,
    endPredict,
};
