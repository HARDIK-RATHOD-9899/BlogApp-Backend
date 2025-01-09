const { Router } = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const UserModel = require("../Model/UserSchema");
const UserRouter = Router();

let otpStore = {};

UserRouter.post("/signup", async (req, res) => {
  try {
    bcrypt.hash(req.body.password, 5, async (err, hash) => {
      if (err) {
        return res.send({ msg: err });
      }
      let obj = {
        username: req.body.username,
        email: req.body.email,
        password: hash,
      };
      let data = await UserModel.create(obj);
      res.status(200).send({ msg: "User registered successfully", data });
    });
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

UserRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            { userID: user._id, username: user.username },
            process.env.secret
          );
          res.status(200).send({ msg: "User Logged in successfully", token });
        } else {
          res.status(501).send({ msg: "Incorrect Passwrod" });
        }
      });
    } else {
      res.status(501).send({ msg: "User not registered" });
    }
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

UserRouter.post("/changepassword", async (req, res) => {
  const { email, oldpassword, newpassword, confirmpassword } = req.body;
  console.log(req.body);
  
  try {
    let user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(400).send({ msg: "User not Registered" });
    }
    let result = await bcrypt.compare(oldpassword, user.password);
    if (result) {
      if (newpassword == confirmpassword) {
        let hash = await bcrypt.hash(newpassword, 5);
        let data = await UserModel.findOneAndUpdate(
          { email: email },
          { password: hash }
        );
        res.status(200).send({ msg: "Changed !!", data });
      } else {
        return res.status(400).send({ msg: "Confirm Password is Not Similar" });
      }
    } else {
      return res.status(400).send({ msg: "Incorrect Passwrod" });
    }
  } catch (error) {
    return res.status(501).send({ msg: error.message });
  }
});

UserRouter.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await UserModel.findOne({ email });
    if (user) {
      let otp = Math.round(Math.random() * 10000);
      otpStore[email] = otp;
      console.log(otpStore);

      const transpoter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.email,
          pass: process.env.passkey,
        },
      });
      let mailOption = {
        from: process.env.email,
        to: email,
        subject: "OTP for Password Reset",
        text: `Your otp for password reset is ${otp}`,
      };

      transpoter.sendMail(mailOption, (error, info) => {
        if (error) {
          return res.status(400).send({ msg: "unable to send OTP" });
        }
        res.status(200).send({ msg: "OTP Sended Successfully" });
      });
    } else {
      res.status(500).send({ msg: "Email Not Registered" });
    }
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

UserRouter.post("/resetPassword", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log(otpStore);
  try {
    if (otpStore[email] == otp) {
      let hashedPassword = await bcrypt.hash(newPassword, 10);
      let data = await UserModel.findOneAndUpdate(
        { email: email },
        { password: hashedPassword }
      );
      otpStore[email] = "";
      res.send({ msg: "Password Changed Successfully", data });
    } else {
      res.send({ msg: "OTP Incorrect" });
    }
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

module.exports = UserRouter;
