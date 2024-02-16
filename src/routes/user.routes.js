import { Router } from "express";
import { logOutUser, loginUser, refreshAccessTokens, userRegister } from "../controllers/user.controller.js";
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
export default router