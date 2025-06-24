import asyncHandler from "../utils/asyncHandler.js";
import Apierror from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import uploadOncloudinary from "../utils/cloudinary.js";
import { AptResponse } from "../utils/AptResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const genereateAccessAndRfreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.genereateAccessToken()
        const refreshToken = user.refreshAccessToken()
        // save in database
        user.refereshToken = refreshToken
        await user.save({ validateBeforeSave: true })
        // return accesstoke and refresh token
        return { accessToken, refreshToken }
    } catch (error) {
        throw new Apierror(500, "Something went wrong while genereating access refresh token")
    }
}

const userRegister = asyncHandler(async (req, res) => {
    // get user detail
    const { username, email, password, fullname } = req.body
    console.log(req.body);

    //check validation not empty
    if (username === "") {
        throw new Apierror(400, "username is required")
    }
    if (email === "") {
        throw new Apierror(400, "email is required")
    }
    if (password === "") {
        throw new Apierror(400, "password must be required")
    }
    if (fullname === "") {
        throw new Apierror(400, "fullname is required")
    }
    //cheack user already exist or not

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existUser) {
        throw new Apierror(409, "username with email already exist")
    }
    //get local path of the coverimage and avatar
    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalpath) {
        throw new Apierror(400, "avatar is required")
    }
    // upload on cludinary
    const avatar = await uploadOncloudinary(avatarLocalpath)
    const coverImage = await uploadOncloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new Apierror(409, "username with email already exist")
    }
    //  create user 
    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    // remove password and referesh token 
    const createUser = await User.findById(user._id).select(
        "-password -refereshToken"
    )
    if (!createUser) {
        throw new Apierror(500, "something went wrong while registering the user")
    }
    return res.status(201).json(new AptResponse(200, createUser, "User registered successfully"))

})

const loginUser = asyncHandler(async (req, res) => {
    // fetch require data
    const { username, email, password } = req.body
    // check for require data must be 
    if (!(username || email)) {
        throw new Apierror(409, "username or email must be require")
    }
    // find user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new Apierror(404, "user does not exist")
    }
    // password check
    const isPasswordValid = await user.ispasswordCorrect(password)
    if (!isPasswordValid) {
        throw new Apierror(404, "invalid user credentials")
    }
    //access and refresh token 
    const { accessToken, refreshToken } = await genereateAccessAndRfreshToken(user._id)

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")
    //send in cookies
    const option = {
        httpOnlty: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new AptResponse(200, "user loggebIn successfully"))

})
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refereshToken: undefined
        }
    },
        {
            new: true
        }
    )
    const option = {
        httpOnlty: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new AptResponse(200, {}, "user looged out"))
})

// access refresh token
const refreshAccessTokens = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new Apierror(401, "unauthrizred request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        console.log(user);
        if (!user) {
            throw new Apierror(401, "invalid refresh token")
        }
        if (incomingRefreshToken !== user.refereshToken) {
            throw new Apierror(401, "refresh token is expired or used")
        }

        const option = {
            httpOnlty: true,
            secure: true
        }
        const { accessToken, refreshToken } = await genereateAccessAndRfreshToken(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new AptResponse(200, "Accessed Token refresh successfully"))
    } catch (error) {
        throw new Apierror(401, error?.message || "invalid token")
    }

})

// change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    console.log("Error",user);
    const isPasswordCurrect = await user.ispasswordCorrect(oldPassword)
    if (!isPasswordCurrect) {
        throw new Apierror(400, "Invalid password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new AptResponse(200,  "Password Changed Successfully"))

})
// get current user

const getCurrentuser = asyncHandler(async (req, res) => {

    return res.status(200).json(new AptResponse(200,req.user,"current user fetch successfully"))
})
// update Account detail

const updateAccountDetail = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new Apierror(400, "All field are required")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            fullname,
            email
        }
    }, { new: true }).select("-password")
    if(!user){
        throw new Apierror(404,"Invalid User")
    }
    return res.status(200).json(new AptResponse(200, user, "Account details Updated Successfully"))
})
// update avatar
const updateUseravatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new Apierror(400, "Avatar file is missing")
    }
    const avatar = await uploadOncloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new Apierror(400, "Error while Uploading on avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password")
    return res.status(200).json(new AptResponse(200, user, "coverImage update Successfully"))

})

// upadate user Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new Apierror(400, "Cover-Image is missing")
    }
    const coverImage = await uploadOncloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new Apierror(400, "while update Cover-Image is misssing")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { coverImage: coverImage.url } }, { new: true }).select("-password")
    return res.status(200).json(new AptResponse(200, user, "coverImage update Successfully"))
})
 
// get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new Apierror(400, "username is missing")
    }
   const channel =  await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers" // becomes fields
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribeTo"  // becomes fields
            }
        },
        {
            // add extra field in  object
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelSubscribeToCount:{
                   $size:"$subscribeTo"
                },
                isSubscribed:{
                    // use for condition 
                    $cond:{
                           if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                           then:true,
                           else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberCount:1,
                channelSubscribeToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new Apierror(404,"chhanel does not exist")
    }
    return res.status(200).json(new AptResponse(200,channel[0],"user channel succfully fetched"))
})

// get watch history

const getWachingHistory = asyncHandler(async (req,res)=>{
     const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"vedios",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                // nested pipeline
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
     ])

     return res.status(200).json(new AptResponse(200,"watch history fetched successfully"))
})

export {
    loginUser,
    userRegister,
    logOutUser,
    refreshAccessTokens,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetail,
    updateUseravatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWachingHistory
}