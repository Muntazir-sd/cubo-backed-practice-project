import { Router } from "express";
import { getAllDepartment } from "../controllers/department.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/')
    .get(getAllDepartment)
    .post(verifyJWT, createNewDepartment)

export default router;