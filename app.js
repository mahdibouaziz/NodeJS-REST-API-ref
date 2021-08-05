const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const MONGODB_URI =
  "mongodb+srv://mahdi:mahdi123@cluster0.sr2ks.mongodb.net/messages?retryWrites=true&w=majority";

const app = express();

// to handle ths storage of the images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

// control which files should be uploaded and which should be skipped.
const fileFilter = (req, file, cb) => {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  // To reject this file pass `false`, like so: cb(null, false);
  // To accept the file pass `true`, like so: cb(null, true);
  // You can always pass an error if something goes wrong: cb(new Error("I don't have a clue!"));
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// register multer
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));

//Serving static images
app.use("/images", express.static(path.join(__dirname, "images")));

// body parser middleware
app.use(bodyParser.json()); //Content-Type: application/json;

// Enable CORS
app.use(cors());

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

//Default error handler middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message || "";
  const errorData = err.data || "";
  return res.status(status).json({ message: message, data: errorData });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to the database");
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
