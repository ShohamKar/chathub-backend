import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

let userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is compulsory"],
  },
  email: {
    type: String,
    required: [true, "Email is compulsory"],
    unique: [true, "Email must be unique"],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    minLength: [8, "Password must be atleast 10 characters"],
    required: [true, "Password is compulsory"],
    select: false
  },
  profilePicture: {
    public_id: {
      type: String,
      required: [true, "Public id for profile picture is must"],
    },
    url: {
      type: String,
      required: [true, "Url for profile picture is must"],
    },
  },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWT = async function(){
  return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: '15d'})
}

userSchema.methods.verifyPassword = async function(password){
  return bcrypt.compare(password, this.password)
}

export default mongoose.model("User", userSchema);
