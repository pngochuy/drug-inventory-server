require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const Drug = require("./models/Drug");

// Kết nối DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to Mongo for Migration...");

    // Đọc file json cũ
    const jsonData = fs.readFileSync("db.json", "utf-8");
    const drugs = JSON.parse(jsonData);

    if (drugs.length > 0) {
      // Xóa dữ liệu rác nếu có
      await Drug.deleteMany({});

      // Đẩy dữ liệu cũ vào
      await Drug.insertMany(drugs);
      console.log(
        `✅ Đã chuyển ${drugs.length} thuốc sang MongoDB thành công!`
      );
    } else {
      console.log("File JSON rỗng, không có gì để chuyển.");
    }

    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
