const nodemailer = require("nodemailer");

// Fungsi untuk mengirim email ke admin
async function sendEmailToAdmin(item) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "info.procurement04@gmail.com",
        pass: "pwsdsrlmxhlltgpa",
      },
    });

    const mailOptions = {
      from: "info.procurement04@gmail.com",
      to: "4dmin.procurement@gmail.com",
      subject: "Pengajuan Baru",
      text: "User telah mengajukan pengajuan baru, silahkan cek di dashboard admin",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to admin: " + info.response);
  } catch (error) {
    console.log(error);
  }
}

// Fungsi untuk mengirim email ke pengguna
async function sendEmailToUser(userEmail) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "info.procurement04@gmail.com",
        pass: "pwsdsrlmxhlltgpa",
      },
    });

    const mailOptions = {
      from: "info.procurement04@gmail.com",
      to: userEmail,
      subject: "Pengajuan Berhasil",
      text: "Pengajuan Anda telah berhasil. Silakan menunggu proses selanjutnya oleh admin.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to user: " + info.response);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendEmailToAdmin,
  sendEmailToUser,
};
