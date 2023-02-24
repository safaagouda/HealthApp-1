var jwt = require('jsonwebtoken');
const userModel = require("../app/database/Models/user.model");
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("bearer ", "");
    const decoded = jwt.verify(token, "privateKey");
    const userData = await userModel.findOne({
      _id: decoded._id,
      "tokens.token": token,
    })
    if (!userData) throw new Error("unAuthorized");
    req.user = userData;
    req.token = token;
    next();
  } catch (e) {
    res.status(500).send({ apiStatus: false, data: e, message: e.message });
  }
};
module.exports=auth
