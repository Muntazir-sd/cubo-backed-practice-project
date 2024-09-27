import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema({
    rolename: {
        type: String,
        required: true
    },
    createdby: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

export const Role = mongoose.model("Role", roleSchema)