import moment from "moment";

import URLParameter from "./URL-parameter.json" assert { type: "json" };

const {
    SEARCH_OPTION_DEFAULT_LIMIT,
    SEARCH_OPTION_DEFAULT_PAGE,
    SEARCH_OPTION_DEFAULT_RADIX,
    SEARCH_OPTION_DEFAULT_SORT_DESCENDING,
    SEARCH_OPTION_MAX_LIMIT,
} = URLParameter;

import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

const checkMongoId = (id) => {
    const check = new RegExp('^[0-9a-fA-F]{24}$');
  
    return check.test(id);
  };
  


const isValidField = (field = "", validFields = []) => {
    if (!Array.isArray(validFields)) {
        throw new Error("SORT.ERROR.VALID_FIELDS_IS_NOT_AN_ARRAY");
    }

    if (validFields.length > 0) {
        const [parentField] = field.split(".");

        return validFields.includes(parentField);
    }
    return true;
};

const checkSearch = (filter) => {
    filter = filter.split(".");

    return filter.length >= 3;
};

export const parsePaginationOption = (queryString = {}) => {
    const { page, limit } = queryString;

    const vPage = page
        ? parseInt(page, SEARCH_OPTION_DEFAULT_RADIX)
        : SEARCH_OPTION_DEFAULT_PAGE;

    const inputLimit = limit
        ? parseInt(limit, SEARCH_OPTION_DEFAULT_RADIX)
        : SEARCH_OPTION_DEFAULT_LIMIT;
    const vLimit =
        inputLimit > SEARCH_OPTION_MAX_LIMIT
            ? SEARCH_OPTION_MAX_LIMIT
            : inputLimit;

    return {
        page: vPage,
        limit: vLimit,
    };
};

export const customQuery = (queryProps, isPredict = false) => {
    let matchQuery = {};
    for (let key in queryProps) {
        if (
            (typeof queryProps[key] == "string" &&
                queryProps[key].split("-").length > 1) ||
            (typeof queryProps[key] == "object" && queryProps[key]?.length > 0)
        ) {
            if (queryProps[key]?.length > 0) {
                matchQuery = {
                    ...matchQuery,
                    [key]: {
                        $gte: moment(queryProps[key][0])
                            .hours(0)
                            .minutes(0)
                            .seconds(0)
                            .milliseconds(0)
                            .toDate(),
                        $lte: moment(queryProps[key][1])
                            .hours(0)
                            .minutes(0)
                            .seconds(0)
                            .milliseconds(0)
                            .add(1, "day")
                            .toDate(),
                    },
                };
            } else {
                matchQuery = {
                    ...matchQuery,
                    [key]: {
                        $lte: moment(queryProps[key])
                            .hours(0)
                            .minutes(0)
                            .seconds(0)
                            .milliseconds(0)
                            .add(1, "day")
                            .toDate(),
                        $gte: moment(queryProps[key])
                            .hours(0)
                            .minutes(0)
                            .seconds(0)
                            .milliseconds(0)
                            .toDate(),
                    },
                };
            }
        } else {
            if (
                queryProps[key] &&
                key !== "role" &&
                key !== "fullName" &&
                key !== "pestLevel" &&
                key !== "pestLevelId"
            ) {
                matchQuery = { ...matchQuery, [key]: queryProps[key] };
            }
        }
    }
    if (isPredict && !queryProps.isFinish) {
        matchQuery = {
            ...matchQuery,
            isFinish: false,
        };
    }
    console.log("matchQuery", matchQuery);
    if (Object.values(matchQuery).length == 0) {
        return [];
    }
    return [{ $match: matchQuery }];
};
const checkIllegalCharacter = (text) => {
    const illegalCharacter = /[|&;$%@"<>()+,]/g;

    return illegalCharacter.test(text);
};

const parseOrOption = (vFilterOption) => {
    const orFilter = [];
    const andFilter = [];
    const query = {};
    Object.keys(vFilterOption).forEach((key) => {
        if (typeof vFilterOption[key] === "string") {
            const splitFilter = vFilterOption[key].split(",");
            if (splitFilter.length > 1) {
                for (let i = 0; i < splitFilter.length; i++) {
                    orFilter.push({
                        [key]: splitFilter[i],
                    });
                }
            } else {
                orFilter.push({
                    [key]: vFilterOption[key],
                });
            }
        } else {
            andFilter.push({
                [key]: vFilterOption[key],
            });
        }
    });

    if (orFilter.length > 0) {
        query.$or = orFilter;
    }

    if (andFilter.length > 0) {
        query.$and = andFilter;
    }

    return query;
};

const parseFilterOption = (queryString = {}, validFields = []) => {
    if (Array.isArray(validFields) && validFields.length === 0) return {};
    let vFilterOption = {};
    const customFilter = [];
    Object.keys(queryString).forEach((key) => {
        if (isValidField(key, validFields)) {
            if (checkSearch(key)) {
                const keys = key.split(".");
                const searchItem = keys[keys.length - 1];

                for (let i = 1; i < keys.length - 1; i++) {
                    const table = pluralize(keys[i]).toLowerCase();
                    customFilter.push(
                        {
                            $lookup: {
                                from: table,
                                localField: keys[i], // field in the orders collection
                                foreignField: "_id", // field in the items collection
                                as: `_${table}`,
                            },
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: [
                                        { $arrayElemAt: [`$_${table}`, 0] },
                                        "$$ROOT",
                                    ],
                                },
                            },
                        },
                        { $project: { [`_${table}`]: 0 } }
                    );
                }

                if (queryString[key].split("-").length > 1) {
                    console.log("Date");
                    customFilter.push({
                        $match: {
                            [searchItem]: {
                                $lt: moment(queryString[key])
                                    .hours(0)
                                    .minutes(0)
                                    .seconds(0)
                                    .milliseconds(0)
                                    .add(1, "day")
                                    .toDate(),
                                $gte: moment(queryString[key])
                                    .hours(0)
                                    .minutes(0)
                                    .seconds(0)
                                    .milliseconds(0)
                                    .toDate(),
                            },
                        },
                    });
                } else {
                    const mongoId = CheckMongoId(queryString[key]);

                    if (mongoId) {
                        console.log("Mongo ID");
                        customFilter.push({
                            $match: {
                                [searchItem]: new ObjectId(queryString[key]),
                            },
                        });
                    } else {
                        console.log("Normal");
                        customFilter.push({
                            $match: {
                                [searchItem]: {
                                    $regex: new RegExp(queryString[key], "gmi"),
                                },
                            },
                        });
                    }
                }
            } else {
                console.log("ABC");
                const mongoId = CheckMongoId(queryString[key]);
                console.log({ mongoId, key: queryString[key] });
                const illegalCharacter = checkIllegalCharacter(
                    queryString[key]
                );
                const booleanCharacter = queryString[key] === "true" || "false";

                if (booleanCharacter === true) {
                    vFilterOption[key] = queryString[key] === "true";
                } else if (mongoId) {
                    vFilterOption[key] = new ObjectId(queryString[key]);
                } else if (illegalCharacter) {
                    vFilterOption[key] = queryString[key];
                } else {
                    const regex = new RegExp(queryString[key], "gmi");
                    vFilterOption[key] = {
                        $regex: regex,
                    };

                    console.log({ regex });
                }
            }
        }
    });

    if (
        customFilter.length > 0 &&
        Object.keys(vFilterOption).length !== 0 &&
        vFilterOption.constructor === Object
    ) {
        vFilterOption = parseOrOption(vFilterOption);

        return [...customFilter, { $match: vFilterOption }];
    }

    if (
        Object.keys(vFilterOption).length !== 0 &&
        vFilterOption.constructor === Object
    ) {
        vFilterOption = parseOrOption(vFilterOption);
    }

    console.log(vFilterOption);
    return customFilter.length > 0 ? customFilter : { ...vFilterOption };
};
const checkNumber = (id) => {
    const check = new RegExp("^\\d+$");
    return typeof id === "number" || check.test(id);
};

const parseSortOption = (
    queryString = {},
    validFields = [],
    defaultSortField = ""
) => {
    if (!defaultSortField || typeof defaultSortField !== "string") {
        throw new Error("SORT.ERROR.DEFAULT_FIELD_NOT_FOUND");
    }

    const { sortType, sortBy } = queryString;

    console.log({ sortType, sortBy });

    const vSortOption = {};

    if (!sortBy && !sortType) {
        vSortOption[defaultSortField] = SEARCH_OPTION_DEFAULT_SORT_DESCENDING;
    } else if (sortBy && !sortType) {
        const fieldToSort = sortBy.split(",").filter(Boolean);

        fieldToSort.forEach((field) => {
            if (field && isValidField(field, validFields)) {
                vSortOption[field] = SEARCH_OPTION_DEFAULT_SORT_DESCENDING;
            } else {
                throw new Error("SORT.ERROR.VALID_FIELD");
            }
        });
    } else if (!sortBy && sortType) {
        vSortOption[defaultSortField] = SEARCH_OPTION_DEFAULT_SORT_DESCENDING;
    } else {
        const fieldToSort = sortBy.split(",").filter(Boolean);
        const orderToSort = sortType
            .split(",")
            .filter(Boolean)
            .map((type) => (type === "asc" ? 1 : -1));

        fieldToSort.forEach((field, index) => {
            if (field && isValidField(field, validFields)) {
                if (checkSearch(field)) {
                    const splitField = field.split(".");
                    const newField = splitField[splitField.length - 1];
                    vSortOption[newField] = orderToSort[index]
                        ? parseInt(
                              orderToSort[index],
                              SEARCH_OPTION_DEFAULT_RADIX
                          )
                        : SEARCH_OPTION_DEFAULT_SORT_DESCENDING;
                } else {
                    vSortOption[field] = orderToSort[index]
                        ? parseInt(
                              orderToSort[index],
                              SEARCH_OPTION_DEFAULT_RADIX
                          )
                        : SEARCH_OPTION_DEFAULT_SORT_DESCENDING;
                }
            } else {
                throw new Error("SORT.ERROR.VALID_FIELD");
            }
        });
    }

    return {
        ...vSortOption,
    };
};

export const ValidateSearchArgs = (
    queryString = {},
    validFields = [],
    defaultSortField = ""
) => {
    const paginationOption = parsePaginationOption(queryString);
    const sortOption = parseSortOption(
        queryString,
        validFields,
        defaultSortField
    );
    const filterOption = parseFilterOption(queryString, validFields);

    return {
        paginationOption,
        sortOption,
        filterOption,
    };
};
export const SumOption = {
    $group: {
        _id: null,
        n: { $sum: 1 },
    },
};
