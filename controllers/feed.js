const { validationResult } = require("express-validator");
const Post = require("../models/post");

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
    const error = new Error("Validation failed, data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
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
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      console.log(post.imageUrl);
      return res.status(200).json({
        message: "Post fetched",
        post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
