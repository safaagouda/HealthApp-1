const router = require("express").Router();
const auth = require("../middleware/auth");
const userController = require("../app/controller/user.controller");
const upload1 = require("../middleware/fileUpload1");

router.get("/all", auth, userController.all);
router.get("/all/:id", auth, userController.single);
router.delete("/all/:id", auth, userController.deleteAccount);
router.patch("/all/:id", auth, userController.editUser);
router.patch("/changePass/", userController.editPass);
router.get("/profile", auth, userController.profile);
router.post('/upload/:id',upload1.single('img'),userController.uploadImage)
router.post("/login", userController.login);
router.get("/logout", auth, userController.logout);
router.post("/register" ,userController.register);
router.post("/verify",userController.verify);
router.post("/send",userController.send)
router.post('/forgotPass',userController.forgot_password)
router.post('/passwordVerify',userController.passwordVerify)
router.get('/search',userController.search)
router.post('/getAllNotificationController',userController.getAllNotification)
router.post('/deleteAllNotification',userController.deleteAllNotification)
router.get('/getAlldoctors',userController.getalldoctors)
router.post('/changeDoctorStatus',userController.changeDoctorStatus)
router.get('/sortPrice',userController.sortPrice)
router.post('/nearstDoctor',userController.nearstDoctor)
router.post('/bookAppointment',auth,userController.bookAppointment)
module.exports = router;
