exports.getPosts = (req, res, next) => {
  return res.status(200).json({
    posts: [{ title: "title", content: "This is a dummy data" }],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  // Create post in the db
  return res.status(201).json({
    message: "Post created successfully",
    post: { title, content },
  });
};
