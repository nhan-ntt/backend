const mongoose = require("mongoose");

const { Schema } = mongoose;

const PlanSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "UserTest",
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
