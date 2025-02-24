import mongoose from "mongoose";

const { Schema } = mongoose;

const RoleSchema = new Schema({
    role: {
        type: String,
        enum: ["admin", "mobile user", "expert", "manager", "field expert"],
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
});

const Role = mongoose.model("Role", RoleSchema);
export default Role;
