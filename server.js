const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();
// .. other imports

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./auth_config.js");
const PORT = process.env.PORT || 3000


// create the JWT middleware
const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}`
});

app.use(morgan("dev"));
app.use(helmet());
app.use(express.static(join(__dirname, "public")));

app.get("/auth_config.json", (req, res) => {
  res.json(authConfig);
});

app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
// Listen on port 3000
app.listen(PORT, () => console.log("Application running on port 3000"));

process.on("SIGINT", function() {
  process.exit();
});

// ..

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!"
  });
});

// ..

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }

  next(err, req, res);
});



module.exports = app;
