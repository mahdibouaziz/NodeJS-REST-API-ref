const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const { syncError, asyncError } = require("../errors/errors");
const User = require("../models/user");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  // for the pagnation we need: currentPage, totalItems, totalPages,ItemsPerPage
  try {
    const totalItems = await Post.find().countDocuments();
    const totalPages = Math.ceil(totalItems / perPage);
    const posts = await Post.find({})
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      message: "posts fetched",
      posts,
      totalPages,
      totalItems,
      currentPage,
    });
  } catch (err) {
    asyncError(err, next);
  }
};

exports.createPost = async (req, res, next) => {
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
  try {
    const user = await User.findById(userId);
    let post = new Post({
      title,
      content,
      creator: user._id,
      imageUrl: imageUrl,
    });
    post = await post.save();
    user.posts = [...user.posts, post._id];
    await user.save();

    // Socket part here
    io.getIO().emit("posts", { action: "create", post: post });

    return res.status(201).json({
      message: "Post created successfully",
      post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    asyncError(err, next);
  }
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

      if (post.creator.toString() !== req.userId.toString()) {
        syncError("Unauthorized", 403);
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

      if (post.creator.toString() !== req.userId.toString()) {
        syncError("Unauthorized", 403);
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((userResult) => {
      userResult.posts = userResult.posts.filter((postResultId) => {
        return postResultId.toString() !== postId.toString();
      });
      return userResult.save();
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
