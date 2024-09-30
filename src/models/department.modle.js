import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema({
    departmentname: {
        type: String,
        required: true
    },
    createdby: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    managerid: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    branchid: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
}, {
    timestamps: true
});

export const Department = mongoose.model("Department", departmentSchema)