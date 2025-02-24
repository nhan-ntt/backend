import mongoose from "mongoose";
const { Schema } = mongoose;

const PestLevelSchema = new Schema(
    {
        code: {
            type: Number,
        },
        name: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    { timestamps: true }
);

const PestLevel = mongoose.model("PestLevel", PestLevelSchema);
export default PestLevel;


