const hasRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied. Role ${req.user.role} is not authorized to access this resource` });
        }
        next();
    };
};

export { hasRole };
