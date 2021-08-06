const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

// POST /auth/signup
router.post(
  "/signup",
  [
    body("email")
      .exists({ checkNull: true, checkFalsy: true })
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((email, { req }) => {
        return User.findOne({ email }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail already exists");
          }
        });
      })
      .normalizeEmail(),

    body("password")
      .exists({ checkNull: true, checkFalsy: true })
      .trim()
      .isLength({ min: 5 }),

    body("name")
      .exists({ checkNull: true, checkFalsy: true })
      .trim()
      .isLength({ min: 3 }),
  ],
  authController.signup
); // register

// POST /auth/login
router.post("/login", authController.login);

// POST /auth/logout
// router.post("/logout");

module.exports = router;
