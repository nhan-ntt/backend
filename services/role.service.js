import Role from "../models/role.model.js";


const getRoles = async () => {
    let roles = await Role.find({ role: { $nin: ["admin", "user"] } });
    if (roles) {
        return roles;
    }
    if (!roles) {
        throw new Error("USER.POST.NO_USER_FOUND");
    }
};


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
        { role: "user", name: "Người dùng" }
    ];

    try {
        const createdRoles = await Role.insertMany(rolesData);
        return createdRoles;
    } catch (error) {
        throw new Error("ROLES.POST.CREATION_FAILED");
    }
};


const getNameByRole = async (role) => {
    try {
        const roleData = await Role.findOne({ role });
        if (!roleData) {
            throw new Error("ROLE.GET.ROLE_NOT_FOUND");
        }
        return roleData.name;
    } catch (error) {
        throw new Error(error.message);
    }
}

export default {
    getRoles,
    getAllRoles,
    createDefaultRoles,
    getNameByRole
};
