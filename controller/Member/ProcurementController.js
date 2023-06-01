const prisma = require("../../bin/prisma");
const {
  sendEmailToAdmin,
  sendEmailToUser,
} = require("../../email/MemberNotifikasiEmail");

class ProcurementController {
  static async getProfile(req, res) {
    try {
      const id = req.user.id;
      const data = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      return res.status(200).json({
        status: "200",
        data: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async getItems(req, res) {
    try {
      const items = await prisma.items.findMany({
        where: {
          userId: req.user.id,
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
          message: "You don't have any procurement item yet",
        });
      } else {
        return res.status(200).json({
          status: "200",
          message: "Succes Get all procurement item",
          data: items,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async getItemStatus(req, res) {
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
          userId: req.user.id,
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
        success: true,
        message: `get all data procurement with filter status = ${status}`,
        items,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async storeItem(req, res) {
    try {
      const { name, description, categoryId, url, quantity, price, duedate } =
        req.body;
      if (
        !name ||
        !description ||
        !categoryId ||
        !url ||
        !quantity ||
        !price ||
        !duedate
      ) {
        return res.status(400).json({
          status: "400",
          message: "All parameter must be filled!",
        });
      }

      const dueDateTime = new Date(duedate);
      const total = price * quantity;

      const item = await prisma.detail_items.create({
        data: {
          name: name,
          url: url,
          description: description,
          categoryId: parseInt(categoryId),
          quantity: quantity,
          price: price,
          total: total,
          duedate: dueDateTime,
        },
      });

      const items = await prisma.items.create({
        data: {
          userId: req.user.id,
          detailId: item.id,
        },
      });

      await sendEmailToAdmin(item);
      await sendEmailToUser(req.user.email);

      return res.status(201).json({
        status: "201",
        message: "Item has ben succesfully sent to admin",
        data: item,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async getItemId(req, res) {
    try {
      let { id } = req.params;

      id = parseInt(id);

      if (!id) {
        return res.status(400).json({
          status: "400",
          message: "ID params must be filled",
        });
      }

      const item = await prisma.items.findUnique({
        where: {
          id: id,
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

      if (!item) {
        return res.status(404).json({
          status: "404",
          message: "Item not found",
        });
      }

      if (item.userId !== req.user.id) {
        return res.status(403).json({
          status: "403",
          message: "You don't have accesss to this items",
        });
      }

      return res.status(200).json({
        status: "200",
        data: item,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
}
module.exports = ProcurementController;
