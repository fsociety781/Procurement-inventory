const prisma = require("../../bin/prisma");

class DashboardController {
  static async index(req, res, next) {
    const { filter } = req.query;
    const page = req.query.page || 0;
    const limit = 10; // Jumlah data per halaman
    const offset = (page - 0) * limit;
    let startDate, endDate;

    // Filter berdasarkan per minggu
    if (filter === "perminggu") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    }

    // Filter berdasarkan per bulan
    if (filter === "perbulan") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate = new Date();
    }

    // Filter berdasarkan per tahun
    if (filter === "pertahun") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setMonth(0);
      startDate.setDate(1);
      endDate = new Date();
    }

    try {
      const Items = await prisma.items.count({});

      const ItemsOnprocess = await prisma.items.count({
        where: {
          status: "onprocess",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const ItemsApprove = await prisma.items.count({
        where: {
          status: "approve",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const ItemsReject = await prisma.items.count({
        where: {
          status: "reject",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const lastRequest = await prisma.items.findMany({
        where: {
          status: "onprocess",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        take: limit,
        skip: offset,
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
        },
        orderBy: {
          detailItems: {
            duedate: "desc",
          },
        },
      });

      let filterMessage = "";
      if (filter === "perminggu") {
        filterMessage = "Data terfilter untuk satu minggu terakhir";
      } else if (filter === "perbulan") {
        filterMessage = "Data terfilter untuk satu bulan terakhir";
      } else if (filter === "pertahun") {
        filterMessage = "Data terfilter untuk satu tahun terakhir";
      }

      return res.status(200).json({
        success: true,
        message: "get data for dashboard",
        data: {
          requestInventory: {
            total: Items,
            processed: ItemsOnprocess,
            approved: ItemsApprove,
            rejected: ItemsReject,
          },
          lastRequest,
        },
        page: parseInt(page),
        filter: filterMessage,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "Failed to retrieve dashboard data." });
    }
  }
}
module.exports = DashboardController;
