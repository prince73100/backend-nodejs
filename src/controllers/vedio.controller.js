import { Vedio } from "../models/vedio.models.js";
import Apierror from "../utils/Apierror.js";
import { AptResponse } from "../utils/AptResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOncloudinary from "../utils/cloudinary.js";

const publishVedio = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const vedioLocalPath = req.files?.videofile[0]?.path
    const thambnelLocalPath = req.files?.thumbnale[0]?.path
    if (!vedioLocalPath) {
        throw new Apierror(400, "vedio is required")
    }

    const vediofiles = await uploadOncloudinary(vedioLocalPath)
    const thembnel = await uploadOncloudinary(thambnelLocalPath)
    const video = await Vedio.create({
        title,
        description,
        videofile: vediofiles.url,
        thumbnale: thembnel.url || ""
    })
    if (!video) {
        throw new Apierror(404, "something error during upload video")
    }
    return res.status(200).json(new AptResponse(200, video, "upload successfull"))
})

export {
    publishVedio
}