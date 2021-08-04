const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");

const app = express();

// body parser middleware
app.use(bodyParser.json()); //Content-Type: application/json;

app.use("/feed", feedRoutes);

app.listen(8080);
