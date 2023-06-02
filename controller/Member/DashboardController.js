const prisma = require("../../bin/prisma");

class DashboardController {
  static async index(req, res) {
    const { filter, page } = req.query;
    page = req.query.page || 0;
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
      const { id: userId } = req.user;
      const total = await prisma.items.count({ where: { userId } });
      const oprocess = await prisma.items.count({
        where: {
          userId,
          status: "onprocess",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      const approved = await prisma.items.count({
        where: {
          userId,
          status: "approve",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      const rejected = await prisma.items.count({
        where: {
          userId,
          status: "reject",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const lastRequest = await prisma.items.findMany({
        where: {
          userId,
          status: "onprocess",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: "desc",
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
      });

      return res.status(200).json({
        success: true,
        message: "get data for dashboard",
        requestInventory: {
          total,
          oprocess: oprocess,
          approved: approved,
          rejected: rejected,
        },
        lastRequest,
        page: parseInt(page),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
}

module.exports = DashboardController;
