import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { publishVedio } from "../controllers/vedio.controller.js";
const router = Router()

router.use(verifyJwt);  // verifyJWT middleware to all routes in this files
router.route("/publishvedio").post(  upload.fields([
    {
        name:"videofile",
        maxCount:1
    },
    {
        name:"thumbnale",
        maxCount:1
    }
]) ,publishVedio)


export default router;