import { Router } from "express";
import { changeCurrentPassword, getCurrentuser, getUserChannelProfile, getWachingHistory, logOutUser, loginUser, refreshAccessTokens, updateAccountDetail, updateUserCoverImage, updateUseravatar, userRegister } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  userRegister
)

router.route("/logIn").post(loginUser)

// secured routes
router.route("/logout").post(verifyJwt, logOutUser)
router.route("/refreshToken").post(refreshAccessTokens)


router.route("/change-password").post(verifyJwt,changeCurrentPassword)

router.route("/current-user").get(verifyJwt,getCurrentuser)

router.route("/update-account").patch(verifyJwt,updateAccountDetail)

router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateUseravatar)

router.route("/cover-image").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJwt,getUserChannelProfile)

router.route("/history").get(verifyJwt,getWachingHistory)

export default router