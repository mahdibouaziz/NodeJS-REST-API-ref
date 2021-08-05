const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const { syncError, asyncError } = require("../errors/errors");

const User = require("../models/user");

//Register the user
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    syncError("Validation failed, data is incorrect", 422, errors);
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        name,
        posts: [],
      });
      return user.save();
    })
    .then((user) => {
      res.status(201).json({ message: "User Created", userId: user._id });
    })
    .catch((err) => {
      asyncError(err, next);
    });
};
