import mongoose from "mongoose";
const { Schema } = mongoose;

const PredictSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        pest: {
            type: String,
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
        timeStart: {
            type: Date,
        },
        timeEnd: {
            type: Date,
        },
        lastTimeEnd: {
            type: Date,
        },
        lastPestLevel: {
            type: Schema.Types.ObjectId,
            ref: "PestLevel",
        },
        currentPestLevel: {
            type: Schema.Types.ObjectId,
            ref: "PestLevel",
        },
        warningForecast: {
            type: Object,
        },
        pestStage: {
            type: String,
        },
        plantStage: {
            type: String,
        },
        isFinish: {
            type: Boolean,
        },
        lastRun: {
            type: Date,
        },
        nextRun: {
            type: Date,
        },
    },
    { timestamps: true, versionKey: false }
);

const Predict = mongoose.model("Predict", PredictSchema);
export default Predict;
