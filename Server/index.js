const express = require("express");
const app = express();

const userRoutes = require("./routes/User");

const dbConnect = require("./config/connect");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// dotenv.config();
require('dotenv').config({ path: '../.env' });
const PORT = process.env.PORT || 4000;

//database connect
dbConnect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);


//routes
app.use("/api/v1/auth", userRoutes);

const classroutes = require('./routes/Class.route')
app.use('/class', classroutes)

const postroutes = require('./routes/Post.route')
app.use('/api/v1/post', postroutes)

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: 'Your server is up and running....'
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});