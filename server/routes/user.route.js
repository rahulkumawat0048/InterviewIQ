import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"
import { getCurrentUser } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter=express.Router()

userRouter.get("/current-user",isAuth,getCurrentUser)


export default userRouter