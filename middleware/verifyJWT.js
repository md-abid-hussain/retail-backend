const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(400).json({ message: "unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "forbidden" });
    }

    req.user = decoded.UserInfo.username;
    req.email = decoded.UserInfo.email;

    next();
  });
};

module.exports = verifyJWT;
