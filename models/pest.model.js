import mongoose from "mongoose";

const { Schema } = mongoose;


const PestStageSchema = new Schema(
    {
        name: { type: String, required: true },
        value: { type: Number, required: true },
        term: { type: String, required: true },
    },
    { _id: false }
);

const PlantStageSchema = new Schema(
    {
        name: { type: String, required: true },
        last: { type: Number }, // duration in days
        value: { type: String, required: true },
    },
    { _id: false }
);

const WarningClassificationSchema = new Schema(
    {
        plant: { type: String, required: true }, // matches Plant.value
        pest: { type: Number, required: true }, // matches PestLevel.value
        level: { type: Number, required: true },
    },
    { _id: false }
);


const PestSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
    },
    pestStages: {
        type: [PestStageSchema],
        required: true,
    },
    plantStages: {
        type: [PlantStageSchema],
        required: true,
    },
    warnings: {
        type: [WarningClassificationSchema],
        required: true,
    },
});


const Pest = mongoose.model("Pest", PestSchema);
export default Pest;