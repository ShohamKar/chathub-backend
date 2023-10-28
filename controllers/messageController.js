import asyncWrapper from "../middlewares/asyncWrapper.js";
import Message from "../models/messageModel.js";
import Chat from '../models/chatModel.js'
import { createCustomError } from "../utils/customError.js";


export let sendMessage = asyncWrapper(async (req, res, next) => {
  let { content, chatId } = req.body
  if (!content || !chatId) {
    return next(createCustomError('Some of the fields are missing', 400))
  }
  let chat = await Chat.findById(chatId)
  if (!chat) {
    return next(createCustomError('Chat does not exists', 400))
  }
  let messageData = {
    sender: req.user._id,
    content,
    chat: chatId
  }
  let message = new Message(messageData)
  message = await (await (
    await message.populate('sender', 'name profilePicture')
  ).populate('chat')).populate('chat.users') 
  await message.save()
  chat.latestMessage = message._id
  await chat.save()
  res.status(201).json({
    success: true,
    message
  })
})

export let getAllMessages = asyncWrapper(async(req, res, next) => {
  let {id} = req.params
  let chat = await Chat.findById(id)
  if(!id || !chat){
    return next(createCustomError('Chat not found', 400))
  }
  let isUsersChat = chat.users.find(ele => ele.equals(req.user._id))
  if(!isUsersChat){
    return next(createCustomError('You are not a part of the chat', 401))
  }
  let messages = await Message.find({chat: id}).populate('sender').populate('chat').sort({ updatedAt: -1 })
  res.json({
    success: true,
    count: messages.length,
    messages
  })
})