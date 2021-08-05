const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const MONGODB_URI =
  "mongodb+srv://mahdi:mahdi123@cluster0.sr2ks.mongodb.net/messages?retryWrites=true&w=majority";
const app = express();

// body parser middleware
app.use(bodyParser.json()); //Content-Type: application/json;

// Enable CORS
app.use(cors());

app.use("/feed", feedRoutes);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to the database");
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
