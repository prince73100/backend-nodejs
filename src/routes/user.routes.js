import { Router } from "express";
import userRegister from "../controllers/user.controller.js";
const router = Router()

router.route("/register").get(userRegister)

export default router