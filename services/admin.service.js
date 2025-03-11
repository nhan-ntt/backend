// CRUD user

import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import bcrypt from "bcryptjs";
import { customQuery, parsePaginationOption } from "../utils/search.js";

const getAllUsers = async ({ paginationProps = {}, queryProps = {} }) => {
    // Parse pagination options with defaults
    const paginationOption = parsePaginationOption(paginationProps);
    const { page = 1, limit = 10 } = paginationOption;
    
    // Format query props
    let queryPropsFormat = customQuery(queryProps);
    
    // Create sort option
    const defaultSortField = "createdAt";
    const sortBy = paginationProps.sortBy || defaultSortField;
    const sortField = sortBy === "" ? defaultSortField : sortBy;
    const sortDirection = paginationProps.sortType === "asc" ? 1 : -1;
    
    const sortOption = { [sortField]: sortDirection };
    
    // Calculate skip for pagination
    const skipOptions = limit * (page - 1);
    
    // Build aggregation pipeline
    let aggr = [];
    
    // Add filters based on queryProps
    if (queryProps.role) {
        aggr.push({
            $match: {
                role: queryProps.role // Filter by role if provided
            }
        });
    }
    
    // Add name search if provided
    if (queryProps.name) {
        aggr.push({
            $match: {
                name: { $regex: queryProps.name, $options: 'i' } // Case-insensitive name search
            }
        });
    }
    
    // Add email search if provided
    if (queryProps.email) {
        aggr.push({
            $match: {
                email: { $regex: queryProps.email, $options: 'i' } // Case-insensitive email search
            }
        });
    }
    
    // Add custom query filters
    if (queryPropsFormat.length > 0) {
        aggr = [...aggr, ...queryPropsFormat];
    }
    
    // Add full text search if needed
    // Note: This requires a text index on the relevant fields
    if (queryProps.search) {
        aggr.push({
            $match: {
                $text: { $search: queryProps.search }
            }
        });
    }
    
    try {
        // Run aggregation with sort, skip, limit in correct order
        let users = await User.aggregate([
            ...aggr,
            { $sort: sortOption },
            { $skip: skipOptions },
            { $limit: limit }
        ]);
        
        // Get total count for pagination
        if (users && users.length > 0) {
            let count = await User.aggregate([
                ...aggr,
                { $count: "total" }
            ]);
            
            return {
                data: users,
                total: count[0]?.total || 0
            };
        } else {
            return {
                data: [],
                total: 0
            };
        }
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        throw error;
    }
};


const createUser = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    return newUser;
};

const updateUser = async (id, data) => {
    if (data.role === "admin") {
        throw new Error("You cannot update user role to admin");
    }
    return await User.findByIdAndUpdate(id, data, { new: true });
};

const deleteUser = async (id) => {
    await User.findByIdAndDelete(id);
    return "User deleted successfully";
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export default {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
};
