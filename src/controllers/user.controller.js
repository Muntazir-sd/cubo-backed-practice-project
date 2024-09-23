import { User } from "../models/user.model.js"
import { handleAsync } from "../utils/HandleAsync.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = handleAsync(async (req, res) => {
    const { fullName, email, username, password, phone } = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const profilePictureLocalPath = req.file.path;


    if (!profilePictureLocalPath) {
        throw new ApiError(400, "Profile picture localy file is required")
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

    if (!profilePicture) {
        throw new ApiError(400, "Profile picture file is required")
    }

    if (phone.trim() === '') {
        throw new ApiError(400, "Phone number is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        phone,
        profile_pic: profilePicture.url,
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = handleAsync(async (req, res) => {
    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const loggedInUser = await User.findById(user._id).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                },
                "User logged In Successfully"
            )
        )
})

export {
    registerUser,
    loginUser
}