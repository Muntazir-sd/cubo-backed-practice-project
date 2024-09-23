import { Router } from "express";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profile_pic",
            maxCount: 1
        }
    ]),
    registerUser
)

export default router;