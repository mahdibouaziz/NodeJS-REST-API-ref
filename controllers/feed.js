const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  return res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "title",
        content: "This is a dummy data",
        imageUrl: "images/pic.jpg",
        creator: {
          name: "mahdi",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  // Create post in the db
  const post = new Post({
    title,
    content,
    creator: { name: "mahdi" },
    imageUrl: "images/pic.jpg",
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
