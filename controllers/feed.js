const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const { syncError, asyncError } = require("../errors/errors");

exports.getPosts = (req, res, next) => {
  Post.find({})
    .then((posts) => {
      return res.status(200).json({ message: "posts fetched", posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    syncError("Validation failed, data is incorrect", 422);
  }

  if (!req.file) {
    syncError("No image provided", 422);
  }

  const imageUrl = req.file.path;

  const title = req.body.title;
  const content = req.body.content;
  // Create post in the db
  const post = new Post({
    title,
    content,
    creator: { name: "mahdi" },
    imageUrl: imageUrl,
  });

  post
    .save(post)
    .then((result) => {
      console.log(result);
      return res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((err) => {
      asyncError(err, next);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        syncError("Could not find post", 404);
      }
      console.log(post.imageUrl);
      return res.status(200).json({
        message: "Post fetched",
        post,
      });
    })
    .catch((err) => {
      asyncError(err, next);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    syncError("Validation failed, data is incorrect", 422);
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    syncError("No file picked", 422);
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        syncError("Could not find post", 404);
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
        post.imageUrl = imageUrl;
      }

      post.title = title;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      return res.status(200).json({ message: "Post updated", post: result });
    })
    .catch((err) => {
      asyncError(err, next);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      // check logged in user
      if (!post) {
        syncError("Could not find post", 404);
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "deleted post" });
    })
    .catch((err) => {
      asyncError(err, next);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
