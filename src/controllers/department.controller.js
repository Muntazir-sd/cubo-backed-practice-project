import { handleAsync } from "../utils/HandleAsync.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { ApiError } from "../utils/ApiError.utils.js";
import { Department } from "../models/department.modle.js";
import mongoose from "mongoose";

const getAllDepartment = handleAsync(async (req, res) => {
    const allDepartment = await Department.find({});
    return res
        .status(200)
        .json(new ApiResponse(200, allDepartment, "fetched all department data sucessfully"))
})

const createNewDepartment = handleAsync(async (req, res) => {
    if (req.user.role !== 'Admin') {
        throw new ApiError(401, "only Admin can create new depatment")
    }

    const { _id } = req.user;
    const { departmentname, createdby, managerid, branchid } = req.body;

    if (departmentname === "") {
        throw new ApiError(400, "department name is required")
    }
    if (!mongoose.Types.ObjectId.isValid(createdby) ||
        !mongoose.Types.ObjectId.isValid(managerid) ||
        !mongoose.Types.ObjectId.isValid(branchid)) {
        throw new ApiError(400, "invalid id")
    }



    const newDepartment = await Department.findOneAndUpdate(
        {
            departmentname,
        },
        {
            $set: {
                departmentname,
                createdby,
                managerid,
                branchid
            }
        },
        {
            new: true,
            upsert: true
        }
    );

    if (!newDepartment) {
        throw new ApiError(400, "Failed to create new department")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newDepartment, "New department Created sucessfully"))
});

export {
    getAllDepartment,
    createNewDepartment
}