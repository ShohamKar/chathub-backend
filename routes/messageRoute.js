import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { getAllMessages, sendMessage } from "../controllers/messageController.js";

let router = express.Router();

router.route('/message').post(authenticate, sendMessage)
router.route('/message/:id').get(authenticate, getAllMessages)

export default router;
