const jwt = require("jsonwebtoken");
const prisma = require("../bin/prisma");
const jwtkey = process.env.JWT_KEY;

async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === undefined) {
    return res.status(401).json({
      status: "401",
      message: "Access Denied! Unauthorized User",
    });
  } else {
    const data = await prisma.acces.findFirst({ where: { token } });

    if (!data) {
      return res.status(401).json({
        status: "401",
        message: "Invalid token",
      });
    }

    jwt.verify(token, jwtkey, (err, authData) => {
      if (err) {
        res.status(401).json({
          status: "401",
          message: "Invalid Token...",
        });
      } else {
        req.user = authData.user;
        req.token = token;
        next();
      }
    });
  }
}

module.exports = verifyToken;
