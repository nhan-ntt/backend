import mongoose from "mongoose";
const { Schema } = mongoose;

const PlanSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        state: {
            type: String,
        },
        city: {
            type: String,
        },
        district: {
            type: String,
        },
        address: {
            type: String,
        },
    },
    { timestamps: true, versionKey: false }
);

const Plan = mongoose.model("Plan", PlanSchema);
export default Plan;
