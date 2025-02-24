import mongoose from "mongoose";
const { Schema } = mongoose;

const ReportSchema = new Schema(
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
        timeEnd: {
            type: Date,
        },
        pestLevel: {
            type: Number,
        },
        note: {
            type: String,
        },
    },
    { timestamps: true, versionKey: false }
);

const Report = mongoose.model("Report", ReportSchema);
export default Report;
