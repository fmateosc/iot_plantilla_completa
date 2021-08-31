const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { checkAuth } = require("../middlewares/authentication.js");
const axios = require("axios");

const auth = {
  auth: {
    username: "admin",
    password: "emqxsecret"
  }
};

//GET BROKER INFO
router.get("/get-broker-info", checkAuth,  async (req, res) => {
  try {
    const url = "http://localhost:8085/api/v4/brokers/";

    const info = await axios.get(url, auth);
        
    const response = {
      status: "success",
      data: info.data
    };

    res.json(response);
  } catch (error) {
    console.log("ERROR GETTING INFO");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    return res.status(500).json(response);
  }
});

//GET BROKER CLIENTS
router.get("/get-broker-clients", checkAuth,  async (req, res) => {
  try {
    const url = "http://localhost:8085/api/v4/clients/";

    const infoClients = await axios.get(url, auth);
        
    const response = {
      status: "success",
      data: infoClients.data
    };

    res.json(response);
  } catch (error) {
    console.log("ERROR GETTING INFO");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    return res.status(500).json(response);
  }
});

module.exports = router;
