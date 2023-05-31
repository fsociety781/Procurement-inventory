require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const loginRouter = require("./routes/Auth");
const adminRouter = require("./routes/Admin");
const memberRouter = require("./routes/Member");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());

app.use(loginRouter);
app.use(adminRouter);
app.use(memberRouter);

module.exports = app;
