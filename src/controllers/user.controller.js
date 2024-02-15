import asyncHandler from "../utils/asyncHandler.js";
import Apierror from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import uploadOncloudinary from "../utils/cloudinary.js";
import { AptResponse } from "../utils/AptResponse.js";


const userRegister = asyncHandler(async (req, res) => {
    // get user detail
    const { username, email, password, fullname } = req.body
    console.log(username);

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

    const existUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existUser) {
        throw new Apierror(409, "username with email already exist")
    }
    // get local path of the coverimage and avatar
    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.path;
    if (!avatarLocalpath) {
        throw new Apierror(400, "avatar is required")
    }
    // upload on cludinary
    const avatar = await uploadOncloudinary(avatarLocalpath)
    const coverimage = await uploadOncloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new Apierror(409, "username with email already exist")
    }
    //  create user 

    const user = User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverimage: coverimage?.url || ""
    })
    // remove password and referesh token 
    const createUser = await User.findById(user._id).select(
        "-password -refereshToken"
    )
    if(!createUser){
        throw new Apierror(500,"something went wrong while registering the user")
    }
    return res.status(201).json(new AptResponse(200,createUser,"User registered successfully"))

})

export default userRegister