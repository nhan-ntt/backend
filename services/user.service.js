import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAddressInfo = async ({ type, parentCode }) => {
    let addressObject;
    let filePath;

    // Determine the file path based on type
    if (type === "state") {
        filePath = path.resolve(__dirname, "../const/state.json");
    } else if (type === "city") {
        filePath = path.resolve(__dirname, "../const/city.json");
    } else if (type === "district") {
        filePath = path.resolve(__dirname, "../const/district.json");
    } else {
        throw new Error("USER_TEST.POST.INVALID_TYPE");
    }


    try {
        // Read the file
        addressObject = fs.readFileSync(filePath, "utf-8");

        if (addressObject) {
            let address = JSON.parse(addressObject);
            let addressArray = Object.values(address);


            if (parentCode && type !== "state") {
                addressArray = addressArray.filter(
                    (item) => item["parent_code"] == parentCode
                );
            }


            if (addressArray.length === 0) {
                throw new Error("USER_TEST.POST.PARENT_CODE_INVALID");
            }
            return addressArray;
        }
    } catch (error) {
        console.error(`Error reading/parsing file: ${error.message}`);
        if (error.message.includes("USER_TEST.POST")) {
            throw error;
        }
        throw new Error("USER_TEST.POST.FILE_NOT_FOUND");
    }
};

const getUserById = async ({ id }) => {
    let user = await User.findById(id);
    if (user) {
        return user;
    }
    if (!user) {
        throw new Error("USER.POST.NO_USER_FOUND");
    }
};

export default {
    getAddressInfo,
    getUserById,
};
