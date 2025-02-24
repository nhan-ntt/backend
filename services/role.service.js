import Role from "../models/role.model.js";

const getAllRoles = async () => {
    try {
        const roles = await Role.find();
        if (!roles || roles.length === 0) {
            throw new Error("ROLE.GET.ROLE_NOT_FOUND");
        }
        return roles;
    } catch (error) {
        throw new Error(error.message);
    }
};

const createDefaultRoles = async () => {
    const existingRoleCount = await Role.countDocuments();
    if (existingRoleCount > 0) {
        throw new Error("ROLES.POST.ROLE_EXIST");
    }

    const rolesData = [
        { role: "mobile user", name: "Người dùng mobile" },
        { role: "admin", name: "Quản trị viên" },
        { role: "expert", name: "Chuyên gia" },
        { role: "manager", name: "Quản lý" },
        { role: "field expert", name: "Chuyên gia đồng ruộng" },
    ];

    try {
        const createdRoles = await Role.insertMany(rolesData);
        return createdRoles;
    } catch (error) {
        throw new Error("ROLES.POST.CREATION_FAILED");
    }
};

export default {
    getAllRoles,
    createDefaultRoles,
};
