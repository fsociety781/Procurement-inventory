const express = require("express");
const member = express.Router();
//import middleware
const AuthMiddleware = require("../../middleware/authMiddleware");
//import Controller
const ProcurementController = require("../../controller/Member/ProcurementController");
const DashBoaradController = require("../../controller/Member/DashboardController");

member.get("/member", AuthMiddleware, DashBoaradController.index);
member.get("/member/profile", AuthMiddleware, ProcurementController.getProfile);
member.get(
  "/member/procurement",
  AuthMiddleware,
  ProcurementController.getItems
);

member.get(
  "/member/procurement/search",
  AuthMiddleware,
  ProcurementController.getItems
);

member.get(
  "/member/procurement/:id",
  AuthMiddleware,
  ProcurementController.getItemId
);
// member.get(
//   "/member/procurement/status/:status",
//   AuthMiddleware,
//   ProcurementController.getItemStatus
// );
member.post(
  "/member/procurement",
  AuthMiddleware,
  ProcurementController.storeItem
);

module.exports = member;
