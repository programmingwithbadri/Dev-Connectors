const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require('passport');

const router = express.Router();

// Load User model
const User = require("../../models/User");

// @route  GET api/users/test
// @desc   Tests Users route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    message: "Users works"
  })
);

// @route  Post api/users/register
// @desc   Register user
// @access Public
router.post("/register", (req, res) => {
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json({
        message: "Email already exists"
      });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: 200, // size
        r: "pg", // rating
        d: "mm" // default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route  POST api/users/login
// @desc   Tests Login Users route
// @access Public
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check for User
    if (!user) {
      return res.status(400).json({
        message: "Invalid User"
      });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // JWT payload
        const jwtPayload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        // Sign Token
        jwt.sign(jwtPayload, keys.secret, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        return res.status(400).json({ message: "Invalid User" });
      }
    });
  });
});

// @route  GET api/users/current
// @desc   Return Current user
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
