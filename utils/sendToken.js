let sendToken = async (res, user, statusCode, message) => {
  let token = await user.getJWT();
  let options = {
    httpOnly: true,
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    secure: true,
    sameSite: 'none'
  };
  return res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
  });
};

export default sendToken;
