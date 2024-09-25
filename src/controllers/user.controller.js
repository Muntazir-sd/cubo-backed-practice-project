import { User } from "../models/user.model.js"
import { handleAsync } from "../utils/HandleAsync.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
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

const logoutUser = handleAsync(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = handleAsync(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const updateUserDetails = handleAsync(async (req, res) => {
    // const { fullName, email, phone, profile_pic } = req.body

    // if (!fullName || !email || !phone && !profile_pic) {
    //     throw new ApiError(400, "All fields are required")
    // }

    // if (profile_pic) {
    //     const profileLocalPath = req.file.path;

    //     if (!profileLocalPath) {
    //         throw new ApiError(400, "Profile picture is required")
    //     }

    //     const profilePicture = uploadOnCloudinary(profileLocalPath)

    //     if (!profilePicture.url) {
    //         throw new ApiError(400, "Failed to upload profile picture")
    //     }
    // }

    // const updateData = {
    //     $unset: {},
    //     $set: {
    //         fullName,
    //         email,
    //         phone
    //     }
    // };

    // // Check if a new profile picture is provided
    // if (profile_pic) {
    //     updateData.$unset = { profile_pic: "" }; // Unset previous profile_pic
    //     updateData.$set.profile_pic = profile_pic; // Set new profile_pic
    // }

    // const user = await User.findByIdAndUpdate(
    //     req.params.id,
    //     updateData,
    //     { new: true }
    // ).select("-password"); // Exclude the password field from the result

    // return res
    //     .status(200)
    //     .json(new ApiResponse(200, user, "Account details updated sucessfully"))

    // console.log(req.body)
    const { fullName, email, phone, profile_pic } = req.body

    const updateData = { $set: {} };

    if (fullName) updateData.$set.fullName = fullName;
    if (email) updateData.$set.email = email;
    if (phone) updateData.$set.phone = phone;

    if (req.file.path) {
        const profilePictureLocalPath = req.file.path;


        if (!profilePictureLocalPath) {
            throw new ApiError(400, "Profile picture localy file is required")
        }

        const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)
        // console.log(profilePicture)
        if (!profilePicture) {
            throw new ApiError(400, "Profile picture file is required")
        }

        // updateData.$unset.profile_pic = "";
        updateData.$set.profile_pic = profilePicture.url;
    }

    // console.log(updateData)

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated sucessfully"))
})

const updateUserPassword = handleAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.params.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

export {
    registerUser,
    loginUser,
    updateUserDetails,
    updateUserPassword,
    logoutUser,
    refreshAccessToken
}