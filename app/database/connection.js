const mongoose = require("mongoose")
mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });