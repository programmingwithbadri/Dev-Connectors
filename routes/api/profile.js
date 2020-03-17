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

// @route  POST api/profile
// @desc   Create or Edit the Current user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubUserName)
      profileFields.githubUserName = req.body.githubUserName;

    // Skills has to be split to array from comma seperated values
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split("/");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.bio.youtube;
    if (req.body.facebook)
      profileFields.social.facebook = req.body.bio.facebook;
    if (req.body.twitter) profileFields.social.twitter = req.body.bio.twitter;
    if (req.body.instagram)
      profileFields.social.instagram = req.body.bio.instagram;
    if (req.body.linkedin)
      profileFields.social.linkedin = req.body.bio.linkedin;

    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          // Update the profile
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then(profile => res.json(profile));
        } else {
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = "That handle already exists";
              res.sta4(400).json(errors);
            }
            // Save Profile
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile));
          });
        }
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
