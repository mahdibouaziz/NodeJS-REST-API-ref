const { validationResult } = require("express-validator");

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
    return res.status(422).json({
      message: "Validation failed, data is incorrect",
      errors: errors.array(),
    });
  }

  const title = req.body.title;
  const content = req.body.content;
  // Create post in the db
  return res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: "2",
      title,
      content,
      creator: { name: "mahdi" },
      createdAt: new Date(),
    },
  });
};
