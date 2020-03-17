const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");

const router = express.Router();

// Load Profile model
const Profile = require("../../models/Profile");

// Load User model
const User = require("../../models/User");

// @route  GET api/profile
// @desc   Get Current user profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.profile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;
