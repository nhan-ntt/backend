import PestLevel from "../models/pest-level.model.js";
import Predict from "../models/predict.model.js";

import {
    getListPestLevel,
    getListPlant,
    getWarningClassification,
    calculateEndTimeSeason,
    getWarningForecast,
} from "../utils/pest-level.util.js";

import { customQuery, parsePaginationOption } from "../utils/search.js";

import mongoose from "mongoose";

const getPredictByQuery = async ({ paginationProps = {}, queryProps = {} }) => {
    try {
        // console.log("Query props:", queryProps);
        // console.log("Pagination props:", paginationProps);
        
        // Parse pagination with safe defaults
        const paginationOption = parsePaginationOption(paginationProps);
        const { page = 1, limit = 10 } = paginationOption;
        
        // Format query props
        let queryPropsFormat = customQuery(queryProps, true) || [];
        
        // Create sort option with safe defaults
        const defaultSortField = "createdAt";
        const sortField = paginationProps?.sortBy || defaultSortField;
        const sortDirection = paginationProps?.sortType === "asc" ? 1 : -1;
        
        const sortOption = { [sortField]: sortDirection };
        
        // Calculate skip
        const skipOptions = limit * (page - 1);
        
        // Initialize aggregation pipeline
        let aggr = [...queryPropsFormat];
        
        // Add pagination stages
        let currentPage = [
            { $sort: sortOption },
            { $skip: skipOptions },
            { $limit: limit }
        ];
        
        // Add pest level filter if provided
        if (queryProps.pestLevelId) {
            aggr.unshift({
                $match: {
                    currentPestLevel: new mongoose.Types.ObjectId(
                        queryProps.pestLevelId
                    ),
                }
            });
        }
        
        // Add isFinish filter if needed
        if (queryProps.isFinish !== undefined) {
            aggr.unshift({
                $match: {
                    isFinish: queryProps.isFinish === true || queryProps.isFinish === "true"
                }
            });
        }
        
        console.log("Aggregation pipeline:", JSON.stringify(aggr));
        
        // Execute aggregation
        let predicts = await Predict.aggregate([...aggr, ...currentPage]);
        
        if (predicts && predicts.length > 0) {
            // Populate references
            await Predict.populate(predicts, {
                path: "currentPestLevel"
            });
            
            // Get total count
            let count = await Predict.aggregate([...aggr, { $count: "total" }]);
            
            // Safe access to count with fallback
            const total = count && count.length > 0 ? count[0].total : 0;
            
            // Format predictions with extra data
            let formatPredicts = predicts.map((predict) => {
                return {
                    ...JSON.parse(JSON.stringify(predict)),
                    temperature: "22 C",
                    humidity: "70%",
                    rainfall: "1.9 mm"
                };
            });
            
            return {
                data: formatPredicts,
                total: total
            };
        } else {
            return {
                data: [],
                total: 0
            };
        }
    } catch (error) {
        console.error("Error in getPredictByQuery:", error);
        throw error;
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
                // Replace the remove() call with one of these modern alternatives:
                await Predict.findByIdAndDelete(predict._id);
                // OR
                // await predictInDb.deleteOne();
                
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
    let { state, city, district, timeStart, pestLevelId, userId, lastTimeEnd, slug } =
        predict;
    if (state && city && district && timeStart && userId) {
        let predictDb = await Predict.findOne({
            state: state,
            city: city,
            district: district,
            slug: slug,
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

            const LIST_PEST_LEVEL = await getListPestLevel(slug);
            const pestStage = LIST_PEST_LEVEL.find(
                (per) => per.value === forecastResult[0].pestLevel
            ).name;

            const LIST_PLANT = await getListPlant(slug);
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
    let { state, city, district, timeStart, slug } = predict;

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

                const LIST_PEST_LEVEL = await getListPestLevel(slug);
                const pestStage = LIST_PEST_LEVEL.find(
                    (per) => per.value === forecastResult[0].pestLevel
                ).name;

                const LIST_PLANT = await getListPlant(slug);
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

export default {
    getPredictByQuery,
    createPredict,
    getPredict,
    removePredict,
    updatePredict,
    endPredict,
    
};
