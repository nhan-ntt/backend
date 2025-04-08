import Report from "../models/report.model.js";
import Predict from "../models/predict.model.js";
import User from "../models/user.model.js";

import { customQuery, parsePaginationOption } from "../utils/search.js";
import predictService from "./predict.service.js";

// import updatePredict from "./predict.service.js";

const createReport = async ({ report }) => {
    if (
        !report.state ||
        !report.city ||
        !report.district ||
        // !report.timeEnd ||
        report.pestLevel === null
    ) {
        throw new Error("REPORT_POST_MISSING_PARAMETER");
    } else {
        let reportModel = new Report({
            ...report,
            timeEnd: report.timeEnd ? new Date(report.timeEnd) : undefined,
            user: report.userId,
            slug: report.slug,
        });
        let sReport = await reportModel.save();

        let predictDb = await Predict.findOne({
            state: sReport.state,
            city: sReport.city,
            district: sReport.district,
            isFinish: false,
        });

        if (predictDb) {
            let sPredict = await predictService.updatePredict({
                _id: predictDb._id,
                state: predictDb.state,
                city: predictDb.city,
                district: predictDb.district,
                timeStart: predictDb.timeStart,
                userId: "server-auto-update-1412", // Temporary signature for IFawcast cron job/auto update predict when update report
            });

            console.log(
                "Successfully updated prediction ",
                sPredict._id,
                " after create new report ",
                sReport._id
            );
        }

        return sReport;
    }
};


const updateReport = async (report) => {
    let reportInDb = await Report.findById(report._id);
    console.log("reportInDb", reportInDb);
    if (reportInDb) {
        if (reportInDb.user.toString() != report.userId.toString()) {
            throw new Error("PREDICT_MOBILE.DELETE.NOT_OWNER");
        } else {
            let sReport = await Report.findByIdAndUpdate(
                report._id,
                {
                    ...report,
                    user: reportInDb.user,
                },
                { new: true }
            );

            let predictDb = await Predict.findOne({
                state: sReport.state,
                city: sReport.city,
                district: sReport.district,
                isFinish: false,
                slug: sReport.slug,
            });

            if (predictDb) {
                let sPredict = await updatePredict({
                    _id: predictDb._id,
                    state: predictDb.state,
                    city: predictDb.city,
                    district: predictDb.district,
                    timeStart: predictDb.timeStart,
                    userId: "server-auto-update-1412", // Temporary signature for IFawcast cron job/auto update predict when update report
                });

                console.log(
                    "Successfully updated prediction ",
                    sPredict._id,
                    " after changing report ",
                    sReport._id
                );
            }

            return sReport;
        }
    } else {
        throw new Error("REPORT_POST_NO_REPORT_FOUND");
    }
};


const removeReport = async ({ reportId }) => {
    let reportInDb = await Report.findByIdAndDelete(reportId);
    if (reportInDb) {
        let predictDb = await Predict.findOne({
            state: reportInDb.state,
            city: reportInDb.city,
            district: reportInDb.district,
            isFinish: false,
        });

        if (predictDb) {
            let sPredict = await updatePredict({
                _id: predictDb._id,
                state: predictDb.state,
                city: predictDb.city,
                district: predictDb.district,
                timeStart: predictDb.timeStart,
                userId: "server-auto-update-1412", // Temporary signature for IFawcast cron job/auto update predict when update report
            });

            console.log(
                "Successfully updated prediction ",
                sPredict._id,
                " after delete report ",
                reportInDb._id
            );
        }

        return reportInDb;
    } else {
        throw new Error("REPORT_POST_NO_REPORT_FOUND");
    }
};


const getReportById = async ({ reportId }) => {
    let reportInDb = await Report.findById(reportId);
    if (reportInDb) {
        return reportInDb;
    } else {
        throw new Error("REPORT_POST_NO_REPORT_FOUND");
    }
};


const getReports = async ({ paginationProps, queryProps }) => {
    try {
        console.log("Getting reports with params:", { paginationProps, queryProps });
        
        // Set defaults if undefined
        const paginationOption = parsePaginationOption(paginationProps || {});
        const queryPropsFormatted = customQuery(queryProps || {}, false); // Change true to false
        
        console.log("Query format:", JSON.stringify(queryPropsFormatted));
        
        // Check if any reports exist at all
        const totalReportsInDb = await Report.countDocuments();
        console.log("Total reports in database:", totalReportsInDb);
        
        if (totalReportsInDb === 0) {
            return { data: [], total: 0 };
        }
        
        const defaultSortField = "createdAt";
        const sortField = paginationProps?.sortBy || defaultSortField;
        const sortDirection = paginationProps?.sortType === "asc" ? 1 : -1;
        const sortOption = { [sortField]: sortDirection };
        
        const { page = 1, limit = 10 } = paginationOption;
        const skipOptions = limit * (page - 1);
        
        // CORRECT PIPELINE ORDER: first match, then sort, then paginate
        let pipeline = [
            ...queryPropsFormatted,        // First filter
            { $sort: sortOption },         // Then sort
            { $skip: skipOptions },        // Then skip
            { $limit: limit }              // Then limit
        ];
        
        console.log("Aggregation pipeline:", JSON.stringify(pipeline));
        let reports = await Report.aggregate(pipeline);
        
        console.log("Reports found:", reports.length);
        
        if (reports && reports.length > 0) {
            await Report.populate(reports, {
                path: "user",
                select: { name: 1, fullName: 1 }, // Include fullName for more matching options
            });
            
            // Get the total count for pagination
            let countPipeline = [
                ...queryPropsFormatted,
                { $count: "id" }
            ];
            let count = await Report.aggregate(countPipeline);
            const total = count && count.length > 0 ? count[0].id : 0;
            
            // Handle name filtering if requested
            if (queryProps?.fullName) {
                try {
                    // Try regex search if text search isn't available
                    const searchOptions = { $in: reports.map(r => r.user?._id).filter(Boolean) };
                    
                    // Try both text search and regex search
                    let users;
                    try {
                        // First attempt: text search
                        users = await User.find({
                            $text: { $search: queryProps.fullName },
                            _id: searchOptions
                        });
                    } catch (err) {
                        console.log("Text search failed, falling back to regex:", err.message);
                        // Fallback: regex search
                        users = await User.find({
                            $or: [
                                { name: { $regex: queryProps.fullName, $options: 'i' } },
                                { fullName: { $regex: queryProps.fullName, $options: 'i' } }
                            ],
                            _id: searchOptions
                        });
                    }
                    
                    console.log("Matching users:", users?.length || 0);
                    
                    if (users && users.length > 0) {
                        const userIdsFind = users.map(el => el._id.toString());
                        const results = reports.filter(el => 
                            el.user && userIdsFind.includes(el.user._id.toString())
                        );
                        return {
                            data: results,
                            total
                        };
                    } else {
                        return { data: [], total };
                    }
                } catch (err) {
                    console.error("Error in name filtering:", err);
                    // Return all reports if name filtering fails
                    return { data: reports, total };
                }
            }
            
            return {
                data: reports,
                total
            };
        } else {
            return {
                data: [],
                total: 0
            };
        }
    } catch (error) {
        console.error("Error in getReports:", error);
        throw error;
    }
};

export default {
    createReport,
    updateReport,
    removeReport,
    getReportById,
    getReports,
};
