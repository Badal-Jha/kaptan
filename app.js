const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const connectDatabase = require("./config/config");

const { requireAuth, isValidUser } = require("./middleware/authMiddleware");
const app = express();

// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
//middle ware

// view engine
app.set("view engine", "ejs");

// database connection
connectDatabase();

app.get("*", isValidUser); //this will apply checkUser on all get req
app.get("/", (req, res) => res.render("home"));
//this mean if you are authenticated you can access this page
app.get("/private", requireAuth, (req, res) => res.render("private"));
app.use(authRoutes);
app.listen(3000, () => {
  console.log(`Server Running on http://localhost:3000`);
});
