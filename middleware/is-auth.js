const jwt = require("jsonwebtoken");

const { syncError } = require("../errors/errors");

const isAuth = (req, res, next) => {
  // get the heeader authoorization
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    syncError("Not authenticated", 401);
  }

  // get the token
  const token = authHeader.split(" ")[1];
  let decodedToken;

  //decode the token
  try {
    decodedToken = jwt.verify(token, "thisisthebestsecreteverevereverever");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    syncError("Not authorized", 401);
  }

  //add the userId to the request
  req.userId = decodedToken.userId;
  next();
};

module.exports = isAuth;
