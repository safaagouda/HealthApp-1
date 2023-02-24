const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const doctorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: [true, "first name is required"],
    },
    password: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      require: [true, "last name is required"],
    },
    RandomNumber: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    Notification: {
      type: Array,
      default: [],
    },
    seenNotification: {
      type: Array,
      default: [],
    },
    Loc: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: [Number],
    },
    contactInfo: {
      address: {
        city: String,
        street: String,
        placeNumber: String,
        email: String
      },
      tel: Array
    },
    desc: {
      type: String,
    },
    website: {
      type: String,
    },
    img: {
      type: String,
    },
    specialization: {
      type: String,
      required: [true, "specialization is required"],
    },
    experience: {
      type: String,
      required: [true, "experience is required"],
    },
    feesPerCunsaltation: {
      type: Number,
      required: [true, "fee is required"],
    },
    desc:{
type:String
    },
    rating:[Number],
    timeslots: [
      {
        day: {
          type: mongoose.Schema.Types.Number,
          enum: [0, 1, 2, 3, 4, 5, 6],
        },
        slots: [String],
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    waitingTime:{
      type:Number
    } ,  tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);
doctorSchema.methods.toJSON = function () {
  const doctorData = this.toObject();
  delete doctorData.__v;
  delete doctorData.password;
  delete doctorData.ConfirmPassword;
  delete doctorData.tokens;
  return doctorData;
};
doctorSchema.methods.addLocations = async function (Latitude, Longitude) {

  this.Loc.coordinates.push(Latitude, Longitude);

};
doctorSchema.methods.addAddress = async function (
  tel,
  city,
  street,
  email,
  placeNumber
) {

  const contact = this.contactInfo;
  contact.address.city = city;
  contact.address.street = street;
  contact.address.placeNumber = placeNumber;
contact.address.email = email
  contact.tel.push(...tel)
};

doctorSchema.pre("save", async function () {
  const data = this;
  if (data.isModified("password")) {
    data.password = await bcrypt.hash(data.password, 12);
  }
});
doctorSchema.statics.checkPass = async (email, oldPass) => {
  const doctorData = await doctor.findOne({ email });
  if (!doctorData) throw new Error("invalid email");
  const checkPass = await bcrypt.compare(oldPass, doctorData.password);
  if (!checkPass) throw new Error("invalid Password");
  return doctorData;
};
doctorSchema.statics.login = async (email, pass) => {
  const doctorData = await doctor.findOne({ email });
  if (!doctorData) throw new Error("invalid email");
  const checkPass = await bcrypt.compare(pass, doctorData.password);
  if (!checkPass) throw new Error("invalid Password");
  return doctorData;
};
doctorSchema.methods.generateToken = async function () {
  const doctor = this;
  if (doctor.tokens.length == 3) throw new Error("token exded");
  const token = jwt.sign({ _id: doctor._id }, "privateKey");
  doctor.tokens = doctor.tokens.concat({ token });
  await doctor.save();
  return token;
};
const doctor = mongoose.model("doctor", doctorSchema);
module.exports = doctor;
