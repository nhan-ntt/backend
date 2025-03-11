import Report from "../models/report.model.js";
import Predict from "../models/predict.model.js";
import User from "../models/user.model.js";

import { customQuery, parsePaginationOption } from "../utils/search.js";
import updatePredict from "./predict.service.js";

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
        });
        let sReport = await reportModel.save();

        let predictDb = await Predict.findOne({
            state: sReport.state,
            city: sReport.city,
            district: sReport.district,
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
                " after create new report ",
                sReport._id
            );
        }

        return sReport;
    }
};
const updateReport = async (report) => {
    let reportInDb = await Report.findById(report._id);
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
    let reports = await Report.aggregate([...aggr, ...currentPage]);
    if (reports && reports.length > 0) {
        await Report.populate(reports, {
            path: "user",
            select: { name: 1 },
        });
        let count = await Report.aggregate([...aggr, { $count: "id" }]);
        if (queryProps.name) {
            let results = [];
            let userIds = reports.map((el) => el.user._id.toString());
            let users = await User.find({
                $text: { $search: queryProps.name },
                _id: { $in: userIds },
            });
            if (users) {
                let userIdsFind = users.map((el) => el._id.toString());
                results = reports.filter((el) =>
                    userIdsFind.includes(el.user._id.toString())
                );
                return {
                    data: results,
                    total: count[0].id,
                };
            } else {
                return { data: results, total: count[0].id };
            }
        } else {
            return {
                data: reports,
                total: count[0].id,
            };
        }
    } else {
        return {
            data: [],
            total: 0,
        };
    }
};

export default {
    createReport,
    updateReport,
    removeReport,
    getReportById,
    getReports,
};
