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
        data: {
          name: data.name,
          nik: data.nik,
          phone: data.phone,
          address: data.address,
          email: data.email,
          username: data.username,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async getItems(req, res) {
    try {
      const { search, categoryId, status } = req.query;
      const page = req.query.page || 0;
      const limit = 10; // Jumlah data per halaman
      const offset = (page - 0) * limit;
      const allowedStatus = ["onprocess", "approve", "reject"];

      let whereCondition = {
        userId: req.user.id,
      };
      let statusCondition = "get all";

      if (search && categoryId) {
        whereCondition = {
          ...whereCondition,
          detailItems: {
            name: {
              contains: search,
            },
            categoryId: {
              equals: parseInt(categoryId),
            },
          },
        };

        statusCondition = "search and category";
      } else if (search) {
        whereCondition = {
          ...whereCondition,
          detailItems: {
            name: {
              contains: search,
            },
          },
        };

        statusCondition = "search";
      } else if (categoryId) {
        whereCondition = {
          ...whereCondition,
          detailItems: {
            categoryId: {
              equals: parseInt(categoryId),
            },
          },
        };

        statusCondition = "category";
      } else if (status && allowedStatus.indexOf(status) > -1) {
        whereCondition = {
          ...whereCondition,
          status: {
            equals: status,
          },
        };

        statusCondition = "status";
      }

      const items = await prisma.items.findMany({
        where: whereCondition,
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
        take: limit,
        skip: offset,
      });

      const totalCount = items.length;
      console.log(items.length);

      if (items.length === 0) {
        return res.status(200).json({
          status: "204",
          message: "No item found",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: `Success ${statusCondition}`,
          data: items,
          page: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        });
      }
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
