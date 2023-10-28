import express from "express";
import { getMyProfile, getUsers, login, logout, register } from "../controllers/userController.js";
import singleUpload from "../middlewares/singleUpload.js";
import { authenticate } from "../middlewares/auth.js";

let router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(singleUpload, login);
router.route("/logout").post(logout);
router.route('/me').get(authenticate, getMyProfile)
router.route('/users').get(authenticate, getUsers)

export default router;
