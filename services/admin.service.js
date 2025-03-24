// CRUD user

import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import bcrypt from "bcryptjs";
import { customQuery, parsePaginationOption } from "../utils/search.js";

const getAllUsers = async ({ paginationProps, queryProps }) => {
    let roles;
    if (queryProps?.role) {
        roles = await Role.find({ role: queryProps.role });
    } else {
        roles = await Role.find({ role: { $nin: ["admin", "user"] } });
    }
    const paginationOption = parsePaginationOption(paginationProps);
    let queryPropsFormat = customQuery(queryProps);

    const defaultSortField = "createdAt";

    const sortField = paginationProps?.sortBy || defaultSortField;
    const sortDirection = paginationProps?.sortType === "asc" ? 1 : -1;
    
    const sortOption = { [sortField]: sortDirection };


    const { page, limit } = paginationOption;
    const skipOptions = limit * (page - 1);

    console.log("Processing request with:", { paginationProps, queryProps });


    if (roles) {
        let roleIds = roles.map((role) => role._id);
        let aggr = [
            {
                $match: {
                    role: { $in: roleIds },
                },
            },
            ...queryPropsFormat,
        ];
        let currentPage = [
            { $skip: skipOptions },
            { $limit: limit },
            { $sort: sortOption },
        ];

        if (queryProps && queryProps.fullName) {
            aggr.unshift({
                $match: {
                    $text: { $search: queryProps?.fullName },
                },
            });
        }

        // if (queryProps && queryProps.fullName && queryProps.fullName.trim() !== "") {
        //     aggr.push({
        //         $match: {
        //             fullName: { $regex: queryProps.fullName, $options: 'i' }
        //         }
        //     });
        // }
        
        let users = await User.aggregate([...aggr, ...currentPage]);

        if (users && users.length > 0) {
            await User.populate(users, {
                path: "role",
                select: { role: 1, name: 1 },
            });
            let count = await User.aggregate([...aggr, { $count: "id" }]);
            return {
                data: users,
                total: count[0].id,
            };
        } else {
            return {
                data: [],
                total: 0,
            };
        }
    } else {
        throw new Error("USER.POST.ROLE_INVALID");
    }
};


const createUserWebApp = async (user) => {
    if ( true
        // user.fullName &&
        // user.dateOfBirth &&
        // user.phone &&
        // user.email &&
        // user.roleId
    ) {
        let userInDb = await User.find({
            email: user.email,
        });
        if (userInDb && userInDb?.length > 0) {
            throw new Error("USER.POST.USER_EXIST");
        } else {
            let newUser = new User({
                ...user,
                fullName: user.fullName,
                password: bcrypt.hashSync(user.password, 8),

                dateOfBirth: user.dateOfBirth,
                phone: user.phone,

            });
            let userCreated = await newUser.save();
            return userCreated;
        }
    } else {
        throw new Error("USER.POST.INVALID_PARAMS");
    }
};


const createUser = async (req, res) => {
    // Save User to Database
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Find role by name
        const roleObject = await Role.findOne({ role: req.body.role });

        if (!roleObject) {
            return res
                .status(400)
                .json({ message: `Role '${req.body.role}' not found` });
        }

        // Create user with role ObjectId
        const user = await User.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: roleObject._id, // Store only the ObjectId
            phone: req.body.phone || "",
            isActive: req.body.isActive || false,
            isBanned: false,
            state: req.body.state || "",
            district: req.body.district || "",
            city: req.body.city || "",
            address: req.body.address || "",
        });

        // Populate the role for response
        const populatedUser = await User.findById(user._id).populate("role");

        // Convert to object to remove password
        const userResponse = populatedUser.toObject();
        delete userResponse.password;

        // Return the user with populated role
        return res.status(201).json(userResponse);
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: error.message });
    }
};


const deleteUser = async ({ id }) => {
    // Validate ID
    if (!id) {
        throw new Error("USER.POST.MISSING_ID");
    }
    
    // Find user
    const user = await User.findById(id);
    console.log("User to be deleted:", user);
    
    // Check if user exists
    if (!user) {
        throw new Error("USER.POST.NO_USER_FOUND");
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    console.log(`User ${user.fullName} (${id}) deleted successfully`);
    
    return user;
};


const updateUser = async (body) => {
    try {
        if (!body._id) {
            throw new Error("USER.UPDATE.MISSING_ID");
        }

        // Find the existing user
        const existingUser = await User.findById(body._id);
        if (!existingUser) {
            throw new Error("USER.UPDATE.USER_NOT_FOUND");
        }

        // Prepare update data with fields from the request
        const updateData = {};
        
        // Handle standard fields that might be updated
        if (body.fullName !== undefined) updateData.fullName = body.fullName;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.state !== undefined) updateData.state = body.state;
        if (body.district !== undefined) updateData.district = body.district;
        if (body.city !== undefined) updateData.city = body.city;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.isBanned !== undefined) updateData.isBanned = body.isBanned;
        if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth;
        
        // Handle role update (could be an object with _id or a direct roleId)
        if (body.role && body.role._id) {
            updateData.role = body.role._id;
        } else if (body.roleId) {
            updateData.role = body.roleId;
        }
        
        // Handle password update with hashing
        if (body.password) {
            updateData.password = bcrypt.hashSync(body.password, 8);
        }
        
        console.log("Updating user with data:", updateData);
        
        // Update the user and return the updated document
        const updatedUser = await User.findByIdAndUpdate(
            body._id,
            updateData,
            { new: true }
        ).populate('role');
        
        if (!updatedUser) {
            throw new Error("USER.UPDATE.FAILED");
        }
        
        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        // Re-throw error to be handled by the route handler
        throw error;
    }
};



export default {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    createUserWebApp,

};
