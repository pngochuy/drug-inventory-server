require("dotenv").config(); // Load biến môi trường từ .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Import Model
const Drug = require("./models/Drug");

const app = express();
const PORT = process.env.PORT || 5000;

// --- CẤU HÌNH MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// --- KẾT NỐI MONGODB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Đã kết nối thành công đến MongoDB"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// --- API ROUTES ---

// 1. Lấy danh sách thuốc (GET)
app.get("/api/drugs", async (req, res) => {
  try {
    // Lấy tất cả, sắp xếp mới nhất lên đầu (theo logic cũ của bạn là unshift)
    // -1 nghĩa là giảm dần (mới nhất -> cũ nhất)
    const drugs = await Drug.find().sort({ _id: -1 });
    res.json(drugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Import danh sách từ Excel (Ghi đè toàn bộ) (POST)
app.post("/api/drugs/import", async (req, res) => {
  const newDrugs = req.body;
  if (!Array.isArray(newDrugs)) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  try {
    // Xóa sạch dữ liệu cũ
    await Drug.deleteMany({});

    // Thêm dữ liệu mới
    await Drug.insertMany(newDrugs);

    res.json({ message: "Import thành công", count: newDrugs.length });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi import: " + error.message });
  }
});

// 3. Thêm mới một thuốc (POST)
app.post("/api/drugs", async (req, res) => {
  try {
    const newDrug = new Drug(req.body);
    await newDrug.save();
    res.json(newDrug);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. Cập nhật thuốc (PUT)
app.put("/api/drugs/:id", async (req, res) => {
  const { id } = req.params;
  const updatedInfo = req.body;

  try {
    // Tìm thuốc có trường 'id' khớp với id gửi lên và update
    // { new: true } để trả về dữ liệu sau khi đã sửa
    const drug = await Drug.findOneAndUpdate({ id: id }, updatedInfo, {
      new: true,
    });

    if (drug) {
      res.json(drug);
    } else {
      res.status(404).json({ message: "Không tìm thấy thuốc" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Xóa thuốc (DELETE)
app.delete("/api/drugs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Drug.findOneAndDelete({ id: id });
    if (result) {
      res.json({ message: "Xóa thành công", id });
    } else {
      res.status(404).json({ message: "Không tìm thấy thuốc để xóa" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
