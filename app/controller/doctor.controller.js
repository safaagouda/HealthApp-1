const doctorModel = require("../database/Models/doctor.model");
const userModel = require("../database/Models/user.model")
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
var randomstring = require("randomstring");
const moment = require("moment");
let mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sm6229639",
    pass: "wcffnlwtgbocomxo",
  },
});

function generateRandomNumber() {
  var minm = 100000;
  var maxm = 999999;
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}
var mailOptions;
class doctor {
  static getDoctorInfo = async (req, res) => {
    try {
      const doctor = await doctorModel.findById(req.params.id);
      res.status(200).send({
        apiStatus: true,
        data: doctor,
        message: "doctor data fetch success",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static updateProfile = async (req, res) => {
    try {
      const doctor = await doctorModel.findByIdAndUpdate(
        req.params.id,
        req.body
      );
      res.status(200).send({
        apiStatus: true,
        data: doctor,
        message: "Doctor profile updated",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getAlldoctorApproved = async (req, res) => {
    try {
      const doctors = await doctorModel.find({ status: "approved" });
      res.status(200).send({
        apiStatus: true,
        data: doctors,
        message: "Doctors fetched successfully",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static single = async (req, res) => {
    try {
      const doctor = await doctorModel.find({_id:req.body.id,status: "approved",});
      res.status(200).send({
        apiStatus: true,
        data: doctor,
        message: "data fetched",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static applyNewDoctor = async (req, res) => {
    try {
      const newDoctor = await doctorModel({ ...req.body, status: "pending" });
      await newDoctor.addLocations(req.body.Latitude, req.body.Longitude);
      await newDoctor.addAddress(req.body.tel,req.body.city,req.body.street,req.body.email,req.body.placeNumber)
      newDoctor.img = req.file.path.replace("public\\", "") || "";  
      await newDoctor.save();
      const adminUser = await userModel.findOne({ isAdmin: true });
      const Notification = adminUser.Notification;
      Notification.push({
        type: "apply-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor.id,
          name: newDoctor.firstName + "" + newDoctor.lastName,
          onclickPath: "/admin/doctors",
        },
      });
      await adminUser.save();
      res.status(201).send({
        apiStatus: true,
        data: newDoctor,
        message: "Doctor Account Applied Successfully",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static login = async (req, res) => {
    try {
      const doctorData = await doctorModel.login(req.body.email, req.body.password);
      const token = await doctorData.generateToken();
      res.status(200).send({
        apiStatus: true,
        data: { doctorData, token },
        message: "Logged In",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static forgot_password = async (req, res) => {
    try {
      const doctorData = await doctorModel.findOne({ email: req.body.email });

      if (doctorData) {
        const email = req.body.email;
        const randomString = randomstring.generate({
          length: 6,
          charset: "hex",
        });
        const data = await doctorModel.updateOne(
          { email: email },
          { $set: { RandomNumber: randomString } }
        );
        mailOptions = {
          from: '"Clinic"<sm6229639gmail.com>',
          to: email,
          subject: "For Reset Password",
          html: "<p>Hii" + doctorData.firstName + "your code is " + randomString,
        };
        mailTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Mail has been sent :- ", info.response);
          }
        });
        res.status(200).send({
          apiStatus: true,
          data: data,
          message: "check your inbox of mail and reset your password.",
        });
      } else {
        res
          .status(200)
          .send({ apiStatus: true, data: "this email does not exists" });
      }
    } catch (e) {
      res.status(500).send({ apiStatus: false, data: e, message: e.message });
    }
  };
  static passwordVerify = async (req, res) => {
    try {
      const password = await bcrypt.hash(req.body.password, 12);
      const user = await doctorModel.findOneAndUpdate(
        { RandomNumber: req.body.randomString },
        { $set: { password: password } }
      );
      if (!user) throw new Error("code is not valid");
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: user,
        message: "verified",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static logout = async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((t) => t.token != req.token);
      await req.user.save();
      res.status(200).send({
        apiStatus: true,
        data: "",
        message: "logged out on device",
      });
    } catch (e) {
      res.status(500).send({ apiStatus: false, data: e, message: e.message });
    }
  };
  static deleteAccount = async (req, res) => {
    if (req.body.userId === req.params.id) {
      try {
        await doctorModel.findByIdAndDelete(req.params.id);
        res.status(200).send({
          apiStatus: true,
          data: user,
          message: "Account has been deleted",
        });
      } catch (e) {
        res.status(500).send({
          apiStatus: false,
          data: e,
          message: e.message,
        });
      }
    } else {
      res.status(403).json("You can delete only your account!");
    }
  };
  static editUser = async (req, res) => {
    try {
      const myUpdates = Object.keys(req.body);
      const allowedEdits = ["feesPerCunsaltation", "waitingTime"];
      const validEdits = myUpdates.every((update) =>
        allowedEdits.includes(update)
      );
      if (!validEdits) throw new Error("invalid edits");
      const user = await doctorModel.findById(req.params.id);
      if (!user) throw new Error("invalid id");
      myUpdates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      res.status(200).send({
        apiStatus: true,
        date: user,
        message: "user data fetched",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        date: e,
        message: e.message,
      });
    }
  };
  static editPass = async (req, res) => {
    try {
      const valid = await doctorModel.checkPass(req.body.email, req.body.oldPass);
      if (!valid) throw new Error("enter correct pass");
      valid.password = req.body.newPass;
      await valid.save();
      res.status(200).send({
        apiStatus: true,
        data: valid,
        message: "password updated",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
}

module.exports = doctor;
