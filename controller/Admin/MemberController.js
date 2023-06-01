const prisma = require("../../bin/prisma");
const { hashSync, genSaltSync, compareSync, hash } = require("bcrypt");

class MemberController {
  static async getMembers(req, res) {
    try {
      const { search, page } = req.query;
      const limit = 10; // Jumlah data per halaman
      const offset = (page - 0) * limit;

      // Menyiapkan kondisi pencarian
      let whereCondition = {
        role: "member",
        is_active: true,
      };

      if (search) {
        whereCondition = {
          ...whereCondition,
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { username: { contains: search } },
          ],
        };
      }

      // Mengambil data dengan kondisi pencarian dan paginasi
      const members = await prisma.user.findMany({
        where: whereCondition,
        select: {
          name: true,
          nik: true,
          phone: true,
          address: true,
          username: true,
          email: true,
        },
        take: limit,
        skip: offset,
      });

      // Menentukan respons berdasarkan hasil query
      if (members.length === 0) {
        return res.status(204).json({
          message: "No members found",
        });
      } else {
        // Menghitung total data untuk paginasi
        const totalCount = await prisma.user.count({ where: whereCondition });
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
          success: true,
          message: "Get Members",
          data: members,
          page: parseInt(page),
          totalPages,
          totalCount,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to search for members." });
    }
  }

  static async getMemberById(req, res) {
    try {
      let { id } = req.params;
      id = parseInt(id);

      const member = await prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          name: true,
          nik: true,
          phone: true,
          address: true,
          username: true,
          email: true,
        },
      });

      if (!member) {
        return res.status(404).json({
          status: "404",
          message: "Member with id " + id + " not found",
        });
      } else {
        return res.status(200).json({
          status: "200",
          message: "Success get member " + member.name + "",
          data: member,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  static async storeMember(req, res) {
    try {
      const { name, nik, phone, address, username, email, password } = req.body;
      if (
        !name ||
        !nik ||
        !phone ||
        !address ||
        !username ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          status: "400",
          message: "All parameter must be filled!",
        });
      }

      const checkUsername = await prisma.user.findFirst({
        where: {
          username: username,
          is_active: true,
        },
      });

      const checkEmail = await prisma.user.findFirst({
        where: {
          email: email,
          is_active: true,
        },
      });

      if (checkUsername) {
        return res.status(400).json({
          status: "400",
          message: "Username has been taken",
        });
      }

      if (checkEmail) {
        return res.status(400).json({
          status: "400",
          message: "Email has been taken",
        });
      }

      const salt = genSaltSync(10);

      const member = await prisma.user.create({
        data: {
          name: name,
          nik: nik,
          phone: phone,
          address: address,
          email: email,
          username: username,
          password: hashSync(password, salt),
        },
      });
      console.log(member);

      return res.status(201).json({
        status: 200,
        message: "Member account succesfully created",
        data: {
          name: member.name,
          email: member.email,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msh: "Username/email has been taken" });
    }
  }

  static async updateMember(req, res) {
    try {
      const { name, nik, phone, address, username, email, password } = req.body;
      let { id } = req.params;
      if (
        !name ||
        !nik ||
        !phone ||
        !address ||
        !username ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          status: "400",
          message: "All parameter must be filled!",
        });
      }

      id = parseInt(id);

      const member = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!member) {
        return res.status(404).json({
          status: "404",
          message: "Member with id " + id + " not found",
        });
      }

      const checkUsername = await prisma.user.findFirst({
        where: {
          username: username,
          is_active: true,
        },
      });

      const checkEmail = await prisma.user.findFirst({
        where: {
          email: email,
          is_active: true,
        },
      });

      if (checkEmail || checkUsername) {
        return res.status(200).json({
          status: "200",
          message: "Username/email has been taken",
        });
      }

      const salt = genSaltSync(10);
      const updatedMember = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          nik: nik,
          phone: phone,
          address: address,
          email: email,
          username: username,
          password: hashSync(password, salt),
        },
      });

      return res.status(201).json({
        status: "201",
        message: "Member account has succesfully updated",
        data: updatedMember,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  static async deleteMember(req, res) {
    try {
      let { id } = req.params;
      id = parseInt(id);

      const member = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!member) {
        return res.status(404).json({
          status: "404",
          message: "Member with id " + id + " not found",
        });
      }

      await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          is_active: false,
        },
      });

      return res.status(200).json({
        status: "200",
        message: "Member account has succesfully deleted",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
}

module.exports = MemberController;
