const router = require("express").Router();
const auth = require("../middleware/auth");
const doctorController = require("../app/controller/doctor.controller");
const upload1 = require("../middleware/fileUpload1");

router.post('/registerAsDoctor',upload1.single('img'),doctorController.applyNewDoctor)
router.post("/login", doctorController.login);
router.get("/logout", auth, doctorController.logout);
router.post('/forgotPass',doctorController.forgot_password)
router.post('/passwordVerify',doctorController.passwordVerify)
router.delete("/all/:id", auth, doctorController.deleteAccount);
router.patch("/all/:id", doctorController.editUser);
router.patch("/changePass", doctorController.editPass);
module.exports = router;
