import express from "express";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  deleteGroup,
  fetchChats,
  removeFromGroup,
  renameGroup
} from "../controllers/chatController.js";
import { authenticate } from "../middlewares/auth.js";

let router = express.Router();

router.route('/chat')
  .post(authenticate, accessChat)
  .get(authenticate, fetchChats)

router.route('/group')
  .post(authenticate, createGroupChat) // make him admin
  .delete(authenticate, deleteGroup)
  
router.route('/rename').patch(authenticate, renameGroup) // allow only if admin
router.route('/groupadd').patch(authenticate, addToGroup)
router.route('/groupremove').patch(authenticate, removeFromGroup)

export default router;
