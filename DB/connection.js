const dotenv = require('dotenv');
const mongoose = require("mongoose");

dotenv.config();

const connectDB = async () => {
  mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
    .then((result) => console.log("connected to the db"))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
