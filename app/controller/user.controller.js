const userModel = require("../database/Models/user.model");
const bcrypt = require("bcryptjs");
const doctorModel = require("../database/Models/doctor.model");
const appointmentModel = require("../database/Models/appointment.model");
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
class user {
  static uploadImage = async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      user.image = req.file.path.replace("public\\", "") || "";
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: user,
        message: "added",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static all = async (req, res) => {
    try {
      const allUsers = await userModel.find();
      res.status(200).send({
        apiStatus: true,
        data: allUsers,
        message: "all data fetched",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static single = async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      const { password, ConfirmPassword, ...other } = user._doc;
      res.status(200).send({
        apiStatus: true,
        data: other,
        message: "data",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static deleteAccount = async (req, res) => {
    if (req.body.userId === req.params.id) {
      try {
        await userModel.findByIdAndDelete(req.params.id);
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
      const allowedEdits = ["professional_statement", "email"];
      const validEdits = myUpdates.every((update) =>
        allowedEdits.includes(update)
      );
      if (!validEdits) throw new Error("invalid edits");
      const user = await userModel.findById(req.params.id);
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
      const valid = await userModel.checkPass(req.body.email, req.body.oldPass);
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
  static login = async (req, res) => {
    try {
      const userData = await userModel.login(req.body.email, req.body.password);
      const token = await userData.generateToken();
      res.status(200).send({
        apiStatus: true,
        data: { userData, token },
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
  static profile = (req, res) => {
    res
      .status(200)
      .send({ apiStatus: true, data: req.user, message: "user profile" });
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
  static register = async (req, res) => {
    try {
      const existingUser = await userModel.findOne({ email: req.body.email });
      if (existingUser) {
        return res
          .status(200)
          .send({ apiStatus: false, message: "User Already exist" });
      }
      const uniqueString = generateRandomNumber();
      req.body.uniqueString = uniqueString;
      const user = new userModel(req.body);
      mailOptions = {
        from: '"verification your account" <sm6229639gmail.com>',
        to: req.body.email,
        subject: "Please confirm your Email account",
        html:
          "<div style='border:1px solid ; '></div>Hello,<h1 style='color:blue;backgroundColor:red'>your code is</h1> your code is" +
          uniqueString,
      };
      await user.save();
      mailTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Mail has been sent :- ", info.response);
        }
      });
      res.status(200).send({
        apiStatus: true,
        data: { user },
        message: "user Added successfully",
      });
    } catch (E) {
      res.status(500).send({
        apiStatus: false,
        data: E,
        message: E.message,
      });
    }
  };
  static send = async (req, res) => {
    try {
      const uniqueString = generateRandomNumber();
      req.body.uniqueString = uniqueString;

      const user = await userModel.findOne({ email: req.body.email });
      user.uniqueString = uniqueString;

      mailOptions = {
        from: '"Clinic " <sm6229639gmail.com>',
        to: req.body.email,
        subject: "Please confirm your Email account",
        html:
          "<h4 style='color:blue'><b>verifing your email your code is </b></h4>" +
          uniqueString,
      };
      mailTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log("message sent");
        }
      });
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: { user },
        message: "user Added successfully",
      });
    } catch (E) {
      res.status(500).send({
        apiStatus: false,
        data: E,
        message: E.message,
      });
    }
  };
  static verify = async (req, res) => {
    try {
      const user = await userModel.findOne({ uniqueString: req.body.code });
      if (user) user.Isverified = true;
      if (!user) throw new Error("code is not valid");
      if (user) await user.save();
      res.status(200).send({
        apiStatus: true,
        data: user,
        message: "verified",
      });
    } catch (E) {
      res.status(500).send({
        apiStatus: false,
        data: E,
        message: E.message,
      });
    }
  };
  static forgot_password = async (req, res) => {
    try {
      const userData = await userModel.findOne({ email: req.body.email });

      if (userData) {
        const email = req.body.email;
        const randomString = randomstring.generate({
          length: 6,
          charset: "hex",
        });
        const data = await userModel.updateOne(
          { email: email },
          { $set: { RandomNumber: randomString } }
        );
        mailOptions = {
          from: '"Clinic"<sm6229639gmail.com>',
          to: email,
          subject: "For Reset Password",
          html: "<p>Hii" + userData.name + "your code is " + randomString,
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
      const user = await userModel.findOneAndUpdate(
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
  static search = async (req, res) => {
    try {
      const doctors = await doctorModel.find({
        $or: [
          { firstName: { $regex: req.query.doctorName } },
          { specialization: { $regex: req.query.specialize } },
          { city: { $regex: req.params.city } },
        ],
        status: "accepted",
      });
      if (doctors.length === "") {
        res.status(201).send({
          apiStatus: true,
          message: "not found doctors",
        });
      }
      res.status(200).json({ doctors, nbHit: doctors.length });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static editData = async (req, res) => {
    //   try {
    //   //   const post = await userModel.findById(req.params.id);
    //   //   if (post.userId === req.body.userId) {
    //   //     const updatePost = await userModel.updateOne({ $set: req.body });
    //   //     res.status(200).send({
    //   //       apiStatus: true,
    //   //       data: updatePost,
    //   //       message: "edited successfully",
    //   //     });
    //   //   }
    //   // } catch (e) {
    //   //   res.status(500).send({
    //   //     apiStatus: false,
    //   //     data: e,
    //   //     message: e.message,
    //   //   });
    //   // }
  };
  static nearstDoctor = async (req, res) => {
    try {
      const Latitude = req.body.Latitude;
      const Longitude = req.body.Longitude;

      const doctorData = await doctorModel.aggregate([
        {
          $geoNear: {
            near: {
              type: "point",
              coordinates: [parseFloat(Latitude), parseFloat(Longitude)],
            },
            distanceField: "distance.calculated",
            maxDistance: parseFloat(1000)*1609,
            key: "Loc",
            spherical:true
          },
        },
        {
          $match: { status: "accepted" },
        },
      ]);
      res.status(200).send({
        apiStatus: true,
        data: {doctorData},
        message: "doctors fetched successfully",
      });
    } catch (E) {
      res.status(500).send({
        apiStatus: false,
        data: E,
        message: E.message,
      });
    }
  };
  static sortPrice = async (req, res) => {
    try {
      if (req.query.SortByValue == 1) {
        var dh = { feesPerCunsaltation: 1 };
      } else if (req.query.SortByValue == 2) {
        var dh = { waitingTime: 1 };
      } else if (req.query.SortByValue == 3) {
        var dh = { feesPerCunsaltation: -1 };
      } else {
        console.log("not found");
      }
      const doctors = await doctorModel.find({ status: "accepted" }).sort(dh);
      if (doctors.length === "") {
        res.status(201).send({
          apiStatus: true,
          message: " not found doctor to show",
        });
      }
      res.status(200).send({
        apiStatus: true,
        data: doctors,
        message: "doctors depend on price from low to high",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static getAllNotification = async (req, res) => {
    try {
      const user = await userModel.findOne({ _id: req.body.userId });
      const seenNotification = user.seenNotification;
      const notification = user.Notification;
      seenNotification.push(...notification);
      user.Notification = [];
      user.seenNotification = notification;
      const updatedUser = await user.save();
      res.status(200).send({
        apiStatus: true,
        data: updatedUser,
        message: "all notification marked as read",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static deleteAllNotification = async (req, res) => {
    try {
      const user = await userModel.findOne({ _id: req.body.userId });
      user.Notification = [];
      user.seenNotification = [];
      const updatedUser = await user.save();
      res.status(200).send({
        apiStatus: true,
        data: updatedUser,
        message: "Notifications deleted successfully",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getalldoctors = async (req, res) => {
    try {
      const doctors = await doctorModel.find({ status: "accepted" });
      res.status(200).send({
        apiStatus: true,
        data: doctors,
        message: "doctors fetched successfully",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static changeDoctorStatus = async (req, res) => {
    try {
      const doctor = await doctorModel.findById(req.body.doctorId);
      if (doctor === null) {
        res.status(201).send({
          apiStatus: true,
          message: "you dont have doctor",
        });
      }
      doctor.status = req.body.status;
      await doctor.save();
      const user = await userModel.findOne({ _id: req.body.userId });
      const Notification = user.Notification;
      Notification.push({
        type: "doctor-account-request-updated",
        message: `Your Doctor Account Request Has ${req.body.status}`,
        onclickPath: "/notification",
      });
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: doctor,
        message: "Account status updated",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static bookAppointment = async (req, res) => {
    try {
      req.body.date = moment(req.body.date, "DD-MM-YYYY").toString();
      req.body.time = moment(req.body.time, "HH:mm").toString();
      req.body.status = "pending";
      const newAppointment = new appointmentModel(req.body);
      await newAppointment.save();
      const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
      user.Notification.push({
        type: "New appointment-request",
        message: `A new Appointment Request from ${req.body.userInfo.name}`,
        onclickPath: "/user/appointments",
      });
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: newAppointment,
        message: "Appointment Book successfully",
      });
    } catch (e) {
      res.status.send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static bookingAvailablity = async (req, res) => {
    try {
      const date = moment(req.body.date, "DD-MM-YYYY").toString();
      const fromTime = moment(req.body.time, "HH-mm")
        .subtract(1, "hours")
        .toString();
      const toTime = moment(req.body.time, "HH-mm")
        .subtract(1, "hours")
        .toString();
      const doctorId = req.body.doctorId;
      const appointment = await appointmentModel.find({
        doctorId,
        date,
        time: {
          $gte: fromTime,
          $lte: toTime,
        },
      });
      if (appointment.length > 0) {
        res.status(200).send({
          apiStatus: true,
          message: "Appointment not available at this time",
        });
      } else {
        res.status(200).send({
          apiStatus: true,
          message: "Appointment  available at this time",
        });
      }
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        message: e,
        data: e.message,
      });
    }
  };
  static userAppointments = async (req, res) => {
    try {
      const userAppointments = await appointmentModel.find({
        userId: req.body.userId,
      });
      res.status(200).send({
        apiStatus: true,
        message: "users Appointment Fetch successfully",
        data: userAppointments,
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        message: e.message,
        data: e,
      });
    }
  };
  static doctorAppointment = async (req, res) => {
    try {
      const doctorAppointments = await appointmentModel.find({
        doctorId: req.body.doctorId,
      });
      res.status(200).send({
        apiStatus: true,
        message: "doctor Appointment Fetch successfully",
        data: doctorAppointments,
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        message: e.message,
        data: e,
      });
    }
  };
  static updateStatus = async (req, res) => {
    try {
      const { appointmentId, status } = req.body;

      const appointments = await appointmentModel.findByIdAndUpdate(
        appointmentId,
        { status }
      );
      const user = await userModel.findOne({ _id: appointments.userId });

      user.Notification.push({
        type: "status-update",
        message: `your appointment has been updated${status}`,
        onclickPath: "/doctor-appointment",
      });
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: appointments,
        message: "Appointment status updated",
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

module.exports = user;
