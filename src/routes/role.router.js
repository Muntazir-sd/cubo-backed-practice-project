import { Router } from "express";
import { createNewRoles, deleteSingleRole, getAllRoles, getSingleRole, updateSingleRole } from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/')
    .get(getAllRoles)
    .post(verifyJWT, createNewRoles)

router.route('/:id')
    .get(getSingleRole)
    .patch(verifyJWT, updateSingleRole)
    .delete(verifyJWT, deleteSingleRole)

export default router;