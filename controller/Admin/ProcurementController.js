const prisma = require("../../bin/prisma");
const nodemailer = require("nodemailer");

class ItemsController {
  static async getAllItems(req, res, next) {
    try {
      let { id } = req.params;
      id = parseInt(id);

      if (id) {
        const item = await prisma.items.findUnique({
          where: {
            id: id,
          },
        });
        return res.status(200).json({
          status: true,
          message: "Succes Get all procurement By Id",
          data: item,
        });
      }

      const items = await prisma.items.findMany({
        include: {
          detailItems: {
            select: {
              name: true,
              url: true,
              description: true,
              categoryId: true,
              quantity: true,
              price: true,
              total: true,
              duedate: true,
            },
          },
          history: {
            select: {
              reason: true,
            },
          },
        },
      });

      if (Object.keys(items).length === 0) {
        return res.status(200).json({
          status: "204",
          message: "No item found",
        });
      } else
        return res.status(200).json({
          status: true,
          message: "Succes Get all procurement item",
          data: items,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async getItemStatus(req, res, next) {
    try {
      const { status } = req.params;
      if (
        status !== "onprocess" &&
        status !== "approve" &&
        status !== "reject"
      ) {
        return res.status(404).json({
          status: "404",
          message: "Only choose available status: onprocess, approve, reject",
        });
      }

      const items = await prisma.items.findMany({
        where: {
          status: status,
        },
        include: {
          detailItems: {
            select: {
              name: true,
              url: true,
              description: true,
              categoryId: true,
              quantity: true,
              price: true,
              total: true,
              duedate: true,
            },
          },
          history: {
            select: {
              reason: true,
            },
          },
        },
      });

      if (Object.keys(items).length === 0) {
        return res.status(200).json({
          status: "204",
          message: "No items found with status " + status,
        });
      }

      return res.status(200).json({
        status: "200",
        message: `get all data procurement with filter status = ${status}`,
        data: items,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "info.procurement04@gmail.com",
          pass: "pwsdsrlmxhlltgpa",
        },
      });

      let { id } = req.params;
      const { status } = req.body;
      let reason = req.body.reason;
      id = parseInt(id);

      if (
        status !== "onprocess" &&
        status !== "approve" &&
        status !== "reject"
      ) {
        return res.status(404).json({
          status: "404",
          message: "Only choose available status: onprocess, approve, reject",
        });
      }

      let item = await prisma.items.findUnique({
        where: {
          id: id,
        },
      });

      if (item && (item.status === "approve" || item.status === "reject")) {
        return res.status(400).json({
          status: "400",
          message: "Item already processed",
        });
      }

      item = await prisma.items.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });

      if (status === "approve") {
        reason = undefined;
      }

      if (status === "reject" && !reason) {
        return res
          .status(400)
          .json({ error: "Reason is required for reject status" });
      }

      const history = await prisma.history.create({
        data: {
          itemsId: id,
          reason: reason,
        },
      });

      const user = await prisma.user.findUnique({
        where: {
          id: item.userId,
        },
      });

      const mailOptions = {
        from: "info.procurement04@gmail.com",
        to: user.email,
        subject: "Penganjuan di" + status,
        text: `Penganjuan anda telah di  ${status}.`,
        html: `<p>Your item status has been updated to ${status}.</p>`,
      };

      if (status === "reject") {
        mailOptions.text += ` Reason: ${reason}`;
        mailOptions.html += `<p>Reason: ${reason}</p>`;
      }

      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({
        status: "200",
        message:
          "Successfully change item status to and send Email Notification " +
          user.email,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
}

module.exports = ItemsController;
