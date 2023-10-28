import User from "../models/userModel.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { createCustomError } from "../utils/customError.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import sendToken from "../utils/sendToken.js";

let register = asyncWrapper(async (req, res, next) => {
  let { name, email, password } = req.body;
  let file = req.file;
  if (!name || !email || !password || !file) {
    return next(createCustomError("Some of the parameters are missing", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(createCustomError("Email id is already registered", 409));
  }
  let myFile = getDataUri(file);

  let pic = await cloudinary.v2.uploader.upload(myFile.content);
  user = new User({
    name,
    email,
    password,
    profilePicture: {
      public_id: pic.public_id,
      url: pic.secure_url,
    },
  });
  await user.save();
  sendToken(res, user, 201, "User registered successfully");
});

let login = asyncWrapper(async (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return next(createCustomError("Some of the parameters are missing", 400));
  }
  let user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(createCustomError('Incorrect email or password', 409))
  }
  let correctPassword = await user.verifyPassword(password)
  if (!correctPassword) {
    return next(createCustomError('Incorrect email or password', 409))
  }
  sendToken(res, user, 200, 'Logged in successfully')
});

export let logout = asyncWrapper(async (req, res, next) => {
  let options = {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: true,
    sameSite: 'none'
  }
  res.status(200).cookie('token', '', options).json({
    success: true,
    message: 'Logged out successfully'
  })
})

let getMyProfile = asyncWrapper(async (req, res, next) => {
  let user = await User.findById(req.user._id)
  if (!user) {
    return next(createCustomError('Unable to get user', 409))
  }
  return res.status(200).json({
    success: true,
    message: 'User Authenticated',
    user
  })
})

let getUsers = asyncWrapper(async (req, res, next) => {
  let keyword = req.query.search ?
    {
      "$or":
        [{ name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } }]
    }
    : {}
  let limit = req.query.count ? (+req.query.count) : 1000
  let users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).limit(limit)
  res.json({
    success: true,
    length: users.length,
    users
  })
})



export { register, login, getUsers, getMyProfile };
