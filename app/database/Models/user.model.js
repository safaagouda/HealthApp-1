const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    Isverified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    ConfirmPassword: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    Notification: {
      type: Array,
      default: [],
    },
    seenNotification: {
      type: Array,
      default: [],
    },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
    profilePicture: {
      type: String,
    },
    RandomNumber: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const userData = this.toObject();
  delete userData.__v;
  delete userData.password;
  delete userData.ConfirmPassword;
  delete userData.tokens;
  return userData;
};
userSchema.pre("save", async function () {
  const data = this;
  if (data.isModified("password", "ConfirmPassword")) {
    data.password = await bcrypt.hash(data.password, 12);
    data.ConfirmPassword = await bcrypt.hash(data.ConfirmPassword, 12);
  }
});
userSchema.statics.checkPass = async (email, oldPass) => {
  const userData = await user.findOne({ email });
  if (!userData) throw new Error("invalid email");
  const checkPass = await bcrypt.compare(oldPass, userData.password);
  if (!checkPass) throw new Error("invalid Password");
  return userData;
};
userSchema.statics.login = async (email, pass) => {
  const userData = await user.findOne({ email });
  if (!userData) throw new Error("invalid email");
  const checkPass = await bcrypt.compare(pass, userData.password);
  if (!checkPass) throw new Error("invalid Password");
  return userData;
};
userSchema.methods.generateToken = async function () {
  const user = this;
  if (user.tokens.length == 3) throw new Error("token exded");
  const token = jwt.sign({ _id: user._id }, "privateKey");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
const user = mongoose.model("user", userSchema);
module.exports = user;
