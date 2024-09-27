import { handleAsync } from "../utils/HandleAsync.utils.js"
import { Role } from '../models/role.modle.js'
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { ApiError } from "../utils/ApiError.utils.js";
import mongoose from "mongoose";



const getAllRoles = handleAsync(async (req, res) => {
    const allRoles = await Role.find({});
    return res
        .status(200)
        .json(new ApiResponse(200, allRoles, "fetched all roles data sucessfully"))
})

const createNewRoles = handleAsync(async (req, res) => {
    if (req.user.role !== 'Admin') {
        throw new ApiError(401, "only Admin can create new roles")
    }

    const { _id } = req.user;
    const { rolename } = req.body;


    const newRole = await Role.findOneAndUpdate(
        {
            rolename,
        },
        {
            rolename,
            createdby: _id
        },
        {
            new: true,
            upsert: true
        }
    );

    if (!newRole) {
        throw new ApiError(400, "Failed to create new role")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newRole, "New role Created sucessfully"))
});

const getSingleRole = handleAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ID format: ${id}`);
    }

    const singleRole = await Role.findById(id);

    if (!singleRole) {
        throw new ApiError(404, `cannot find role with id: ${id}`)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, singleRole, "fetched single role sucessfully"))
})

const updateSingleRole = handleAsync(async (req, res) => {
    if (req.user.role !== 'Admin') {
        throw new ApiError(401, "only Admin can update roles")
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ID format: ${id}`);
    }

    const { rolename } = req.body;


    const updatedRole = await Role.findByIdAndUpdate(
        id,
        {
            $set: {
                rolename
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRole, "Role details updated sucessfully"))
})


const deleteSingleRole = handleAsync(async (req, res) => {
    if (req.user.role !== 'Admin') {
        throw new ApiError(401, "only Admin can delete roles")
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ID format: ${id}`);
    }


    await Role.findByIdAndDelete(id)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Role Deleted Sucessfully"))
})


export {
    getAllRoles,
    createNewRoles,
    getSingleRole,
    updateSingleRole,
    deleteSingleRole
}