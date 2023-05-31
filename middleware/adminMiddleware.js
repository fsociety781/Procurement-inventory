async function verifyToken(req, res, next) {
  if (req.user.role != "admin") {
    return res.status(403).json({
      status: "403",
      message: "Access Denied! Access admin only",
    });
  }
  next();
}
module.exports = verifyToken;
