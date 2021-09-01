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

router.get("/users", checkAuth, async (req, res) => {
  try {
    var users = await User.find();
    var totalUsers = users.length;

    var usersActives = await User.find({ active: true });
    var totalUsersActives = usersActives.length;

    var usersInactives = await User.find({ active: false });
    var totalUsersInactives = usersInactives.length;

    const response = {
      status: "success",
      data: users,
      totalUsers: totalUsers,
      totalUsersActives: totalUsersActives,
      totalUsersInactives: totalUsersInactives
    };

    res.json(response);
  } catch (error) {
    console.log("ERROR GETTING USERS");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    return res.status(500).json(response);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    var user = await User.findOne({ email: email });

    //if no email
    if (!user) {
      const response = {
        status: "error",
        error: "Invalid Credentials"
      };
      return res.status(401).json(response);
    }

    //if email and user ok
    if (bcrypt.compareSync(password, user.password)) {
      user.set("password", undefined, { strict: false });   

      const token = jwt.sign({ userData: user }, "securePasswordHere", {
        expiresIn: 60 * 60 * 24 * 30
      });

      const response = {
        status: "success",
        token: token,
        userData: user
      };

      return res.json(response);
    } else {
      const response = {
        status: "error",
        error: "Invalid Credentials"
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    console.log(error);
  }
});

//REGISTER
router.post("/register", checkAuth, async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const encryptedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      name: name,
      email: email,
      created_at: new Date(),
      password: encryptedPassword,
      isAdmin: false,
      active: false,
    };

    var user = await User.create(newUser);

    const response = {
      status: "success"
    };

    //Crear perfil con el id del usuario y el resto de campos en blanco
    await createPerfil(user);

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

//UPDATE USER
router.put("/update", checkAuth, async (req, res) => {
  try {
    const userId = req.body.id;
    const userName = req.body.name;
    const userEmail = req.body.email;

    await User.updateOne(
      { _id: userId },
      {
        name: userName,
        email: userEmail
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

    console.log(response);

    return res.status(500).json(response);
  }
});

//Activate - desactivate user
router.put("/activateDesactivate", checkAuth, async (req, res) => {
  try {
    const userId = req.body.userId;
    const userActive = req.body.userActive;

    await User.updateOne(
      { _id: userId },
      {
        active: !userActive
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

    console.log(response);

    return res.status(500).json(response);
  }
});

//GET MQTT WEB CREDENTIALS
router.post("/getmqttcredentials", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const credentials = await getWebUserMqttCredentials(userId);

    const response = {
      status: "success",
      username: credentials.username,
      password: credentials.password
    };

    res.json(response);

    setTimeout(() => {
      getWebUserMqttCredentials(userId);
    }, 5000);

    return;
  } catch (error) {
    console.log(error);

    const response = {
      status: "error"
    };

    return res.status(500).json(response);
  }
});

//GET MQTT CREDENTIALS FOR RECONNECTION
router.post(
  "/getmqttcredentialsforreconnection",
  checkAuth,
  async (req, res) => {
    try {
      const userId = req.userData._id;
      const credentials = await getWebUserMqttCredentialsForReconnection(
        userId
      );

      const response = {
        status: "success",
        username: credentials.username,
        password: credentials.password
      };

      console.log(response);
      res.json(response);

      setTimeout(() => {
        getWebUserMqttCredentials(userId);
      }, 15000);
    } catch (error) {
      console.log(error);
    }
  }
);

//**********************
//**** FUNCTIONS *******
//**********************

// mqtt credential types: "user", "device", "superuser"
async function getWebUserMqttCredentials(userId) {
  try {
    var rule = await EmqxAuthRule.find({ type: "user", userId: userId });

    if (rule.length == 0) {
      const newRule = {
        userId: userId,
        username: makeid(10),
        password: makeid(10),
        publish: [userId + "/#"],
        subscribe: [userId + "/#"],
        type: "user",
        time: Date.now(),
        updatedTime: Date.now()
      };

      const result = await EmqxAuthRule.create(newRule);

      const toReturn = {
        username: result.username,
        password: result.password
      };

      return toReturn;
    }

    const newUserName = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne(
      { type: "user", userId: userId },
      {
        $set: {
          username: newUserName,
          password: newPassword,
          updatedTime: Date.now()
        }
      }
    );

    // update response example
    //{ n: 1, nModified: 1, ok: 1 }

    if (result.n == 1 && result.ok == 1) {
      return {
        username: newUserName,
        password: newPassword
      };
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getWebUserMqttCredentialsForReconnection(userId) {
  try {
    const rule = await EmqxAuthRule.find({ type: "user", userId: userId });

    if (rule.length == 1) {
      const toReturn = {
        username: rule[0].username,
        password: rule[0].password
      };
      return toReturn;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//Funcion para crear el perfil del usuario
async function createPerfil(user) {
  const newProfile = {
    userId: user._id,
    company: '',
    avatar: '',
    jobTitle: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: ''
  };

  var profile = await Profile.create(newProfile);

  return;  
}

module.exports = router;