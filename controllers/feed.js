const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const { syncError, asyncError } = require("../errors/errors");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  let totalPages;

  // for the pagnation we need: currentPage, totalItems, totalPages,ItemsPerPage
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      totalPages = Math.ceil(totalItems / perPage);
      return Post.find({})
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      return res.status(200).json({
        message: "posts fetched",
        posts,
        totalPages,
        totalItems,
        currentPage,
      });
    })
    .catch((err) => {
      asyncError(err, next);
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

  // get the user from the request
  const userId = req.userId;
  let user;
  let post;

  User.findById(userId)
    .then((userResult) => {
      user = userResult;
      post = new Post({
        title,
        content,
        creator: user._id,
        imageUrl: imageUrl,
      });
      return post.save();
    })
    .then((postResult) => {
      post = postResult;
      user.posts = [...user.posts, post._id];
      return user.save();
    })
    .then((updatedUser) => {
      return res.status(201).json({
        message: "Post created successfully",
        post,
        creator: { _id: user._id, name: user.name },
      });
    })
    .catch((err) => {
      asyncError(err, next);
    });

  // post
  //   .save(post)
  //   .then((result) => {
  //     post = result;
  //     return User.findById(userId);
  //   })
  //   .then((user) => {
  //     console.log("Post: ", post);
  //     user.posts = [...user.posts, post._id];
  //     console.log("UserPosts: ", user.posts);
  //     return user.save();
  //   })
  //   .then((user) => {
  //     return res.status(201).json({
  //       message: "Post created successfully",
  //       post,
  //     });
  //   })
  //   .catch((err) => {
  //     asyncError(err, next);
  //   });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        syncError("Could not find post", 404);
      }
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
