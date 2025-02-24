const unauthorized = (reason) => ({
    success: false,
    code: 401,
    reason: reason || "AUTH.ERROR.NOT_LOGGED_IN",
});

const badRequest = (reason) => ({
    success: false,
    code: 400,
    reason: reason || "BAD_REQUEST",
});

const notFound = (reason) => ({
    success: false,
    code: 404,
    reason: reason || "NOT_FOUND",
});

const forbidden = (reason) => ({
    success: false,
    code: 403,
    reason: reason || "FORBIDDEN",
});

const serverError = (reason) => ({
    success: false,
    code: 500,
    reason: reason || "INTERNAL_SERVER_ERROR",
});

const tooMany = (reason) => ({
    success: false,
    code: 429,
    reason: reason || "TOO_MANY_REQUESTS",
});

const success = (data) => ({
    success: true,
    code: 200,
    data,
});

export default {
    unauthorized,
    badRequest,
    notFound,
    forbidden,
    serverError,
    tooMany,
    success,
};
