const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { checkAuth } = require("../middlewares/authentication.js");

//models import
import User from "../models/user.js";
import Profile from "../models/profile.js";
import EmqxAuthRule from "../models/emqx_auth.js";

//POST -> req.body
//GET -> req.query

//******************
//**** A P I *******
//******************

//GET PROFILE
router.post("/profile", checkAuth, async (req, res) => {  
  try {
    const userId = req.body.userId;
    
    var profile = await Profile.find({userId: userId});  
    var user = await User.find({_id: userId});  

    const response = {
      status: "success",
      profile: profile,
      user: user
    };

    res.json(response);
  } catch (error) {
    console.log("ERROR GETTING PROFILE");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    return res.status(500).json(response);
  }
});

//UPDATE PROFILE
router.put("/profile_update", checkAuth, async (req, res) => {
  try {
    const userId = req.body.userId;
    const email = req.body.email;
       
    const company = req.body.company;
    const avatar = req.body.avatar;
    const jobTitle = req.body.jobTitle;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;
    const city = req.body.city;
    const country = req.body.country;
    const postalCode = req.body.postalCode;
    const phone = req.body.phone;
          

    //UPDATE USER EMAIL
    await User.updateOne(
      { _id: userId },
      {
        email: email
      }
    );

    //UPDATE PROFILE
    await Profile.updateOne(
      { userId: userId },
      {
        company: req.body.company,
        avatar: req.body.avatar,
        jobTitle: req.body.jobTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        postalCode: req.body.postalCode,
        phone: req.body.phone
      }
    );

    const response = {
      status: "success"
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("ERROR - REGISTER ENDPOINT");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    return res.status(500).json(response);
  } 
});





module.exports = router;
