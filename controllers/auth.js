const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  // check if the email exists
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        syncError("Email is invalid", 401);
      }
      loadedUser = user;
      // check if the password is correct
      return bcrypt.compare(password, user.password);
    })
    .then((passwordIsEqual) => {
      if (!passwordIsEqual) {
        syncError("Password is invalid", 401);
      }
      // generate token and return it
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "thisisthebestsecreteverevereverever",
        { expiresIn: "1h" }
      );
      return res
        .status(200)
        .json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      asyncError(err, next);
    });
};
