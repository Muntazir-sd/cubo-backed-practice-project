import { Router } from "express";
import { loginUser, registerUser, updateUserDetails, updateUserPassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(
    upload.single('profile_pic'),
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/change-password").post(
    updateUserPassword
)

router.route("/update-account/:id").patch(
    upload.single('profile_pic'),
    updateUserDetails
)

export default router;