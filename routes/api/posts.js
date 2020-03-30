const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load Post model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const ValidatePostInput = require("../../validations/post");

// @route  GET api/posts
// @desc   Get posts
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      if (posts) {
        return res.json(posts);
      } else {
        return res.status(404).json({
          errors: "No Posts found"
        });
      }
    })
    .catch(() =>
      res.status(404).json({
        errors: "No Posts found"
      })
    );
});

// @route  GET api/posts/:id
// @desc   Get posts by Id
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => {
      if (posts) {
        return res.json(posts);
      } else {
        return res.status(404).json({
          errors: "No Posts found"
        });
      }
    })
    .catch(() =>
      res.status(404).json({
        errors: "Post not found"
      })
    );
});

// @route  POST api/posts
// @desc   Create posts
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route  DELETE api/posts/:id
// @desc   DELETE posts by Id
// @access Public
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne().then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check post owner
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              errors: "User not authorized to delete this Post"
            });
          }

          post.remove().then(() => res.json({ success: true }));
        })
        .catch(() =>
          res.status(404).json({
            errors: "Post not found"
          })
        );
    });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(() => {
      Post.findById(req.params.id)
        .then(post => {
          // Check if the post is already liked
          // By checking the posts like array if it contains the user id
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ errors: "User already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ errors: "No post found" }));
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(() => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ errors: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(() => res.status(404).json({ errors: "No post found" }));
    });
  }
);

module.exports = router;
