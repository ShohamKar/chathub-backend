import asyncWrapper from "../middlewares/asyncWrapper.js";
import Chat from "../models/chatModel.js";
import User from '../models/userModel.js'
import { createCustomError } from "../utils/customError.js";

export let accessChat = asyncWrapper(async (req, res, next) => {
  let { userId } = req.body
  if (!userId) {
    return next(createCustomError('Please enter a user id', 400))
  }
  let myChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.user._id } } }
    ]
  }).populate('users')
    .populate('latestMessage')

  myChat = await User.populate(myChat, {
    path: "latestMessage.sender"
  })
  if (myChat.length > 0) {
    res.json({
      success: true,
      chat: myChat[0]
    })
  }
  else {
    let chat = new Chat({
      chatName: "dm",
      isGroupChat: false,
      users: [
        userId,
        req.user._id
      ]
    })
    await chat.save()
    myChat = await chat.populate('users')
    res.json({
      success: true,
      chat: myChat
    })
  }
})

export let fetchChats = asyncWrapper(async (req, res, next) => {
  let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate('users')
    .populate('latestMessage')
    .populate('groupAdmin')
    .sort({ updatedAt: -1 })

  chats = await User.populate(chats, {
    path: "latestMessage.sender"
  })
  res.json({
    success: true,
    count: chats.length,
    chats
  })
})

export let createGroupChat = asyncWrapper(async (req, res, next) => {
  let { chatName, users } = req.body
  if (!chatName || !users) {
    return next(createCustomError('Some of the fileds are missing', 400))
  }
  users = JSON.parse(users) // bcoz data backend gets is in form of string, so need to convert to array
  users.push(req.user._id)
  let newGroupChat = new Chat({
    chatName,
    isGroupChat: true,
    users,
    groupAdmin: req.user._id
  })
  await newGroupChat.save()
  let chat = await Chat.findById(newGroupChat._id)
    .populate('users')
    .populate('latestMessage')
    .populate('groupAdmin')
  res.status(201).json({
    success: true,
    message: 'Group Chat created successfully',
    chat: chat
  })
})

export let renameGroup = asyncWrapper(async (req, res, next) => {
  let { groupId, groupName } = req.body
  if (!groupId || !groupName) {
    return next(createCustomError('Some of the fileds are missing', 400))
  }

  let group = await Chat.findById(groupId)
    .populate('users')
    .populate('latestMessage')
    .populate('groupAdmin')
  if(!group){
    return next(createCustomError('Group not found', 404))
  }
  if (!group.groupAdmin._id.equals(req.user._id)) {
    return next(createCustomError('Only admin can rename the group', 401))
  }

  if (!group || group.isGroupChat === false) {
    return next(createCustomError('Group does not exists', 400))
  }
  group.chatName = groupName
  await group.save()

  res.json({
    success: true,
    message: 'Group name updated',
    chat: group
  })
})

export let addToGroup = asyncWrapper(async (req, res, next) => {
  let { userId, groupId } = req.body
  if (!userId || !groupId) {
    return next(createCustomError('Some of the fileds are missing', 400))
  }
  let group = await Chat.findById(groupId)
  if (!group) {
    return next(createCustomError('Group not found', 400))
  }
  let alreadyExists = group.users.find(ele => ele.equals(userId))
  if (alreadyExists) {
    return next(createCustomError('User is already in the group', 400))
  }
  group.users.push(userId)
  await group.save()
  res.json({
    success: true,
    message: 'User added to group'
  })
})

export let removeFromGroup = asyncWrapper(async (req, res, next) => {
  let { userId, groupId } = req.body
  if (!userId || !groupId) {
    return next(createCustomError('Some of the fileds are missing', 400))
  }
  if (req.user._id.equals(userId)) {
    return next(createCustomError('Admin cannot remove himself', 400))
  }
  let group = await Chat.findById(groupId)
  if (!group) {
    return next(createCustomError('Group not found', 400))
  }
  let alreadyExists = group.users.find(ele => ele.equals(userId))
  if (!alreadyExists) {
    return next(createCustomError('User is not in group', 400))
  }
  group.users = group.users.filter(ele => !ele.equals(userId))
  await group.save()
  res.json({
    success: true,
    message: 'User removed from group'
  })
})

export let deleteGroup = asyncWrapper(async (req, res, next) => {
  let { groupId } = req.body
  let group = await Chat.findById(groupId)
  if (!groupId || !group || group.isGroupChat === false) {
    return next(createCustomError('Group not found', 400))
  }
  if (!group.groupAdmin.equals(req.user._id)) {
    return next(createCustomError('Only admin can delete the group', 401))
  }
  await Chat.findByIdAndDelete(groupId)
  res.json({
    success: true,
    message: 'Group deleted successfully'
  })
})