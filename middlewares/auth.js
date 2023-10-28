import jwt from "jsonwebtoken";
import { createCustomError } from "../utils/customError.js";
import User from "../models/userModel.js";

let authenticate = async (req, res, next) => {
  let { token } = req.cookies;
  let options = {
    httpOnly: true,
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    secure: true,
    sameSite: 'none'
  };
  if (!token) {
    return next(createCustomError('Some error occured', 401))
  }
  let { id } = jwt.verify(token, process.env.JWT_SECRET, options);
  let user = await User.findById(id);
  if (!user) {
    return next(createCustomError("Some error occured", 401));
  }
  req.user = user;
  next();
};

export { authenticate };
