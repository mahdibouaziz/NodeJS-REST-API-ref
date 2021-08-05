const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const feedRoutes = require("./routes/feed");

const MONGODB_URI =
  "mongodb+srv://mahdi:mahdi123@cluster0.sr2ks.mongodb.net/messages?retryWrites=true&w=majority";
const app = express();

//Serving static images
app.use("/images", express.static(path.join(__dirname, "images")));

// body parser middleware
app.use(bodyParser.json()); //Content-Type: application/json;

// Enable CORS
app.use(cors());

app.use("/feed", feedRoutes);

//Default error handler middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  return res.status(status).json({ message: message });
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
