const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, "db.json");

// Middleware
app.use(cors()); // Cho phép React truy cập
app.use(bodyParser.json({ limit: "50mb" })); // Tăng giới hạn để upload file Excel lớn

// Hàm tiện ích: Đọc dữ liệu từ file
const readData = () => {
  if (!fs.existsSync(DB_FILE)) {
    return []; // Nếu chưa có file thì trả về mảng rỗng
  }
  const data = fs.readFileSync(DB_FILE, "utf8");
  return data ? JSON.parse(data) : [];
};

// Hàm tiện ích: Ghi dữ liệu vào file
const writeData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
};

// --- API ROUTES ---

// 1. Lấy danh sách thuốc (GET)
app.get("/api/drugs", (req, res) => {
  const drugs = readData();
  res.json(drugs);
});

// 2. Import danh sách từ Excel (Ghi đè toàn bộ) (POST)
app.post("/api/drugs/import", (req, res) => {
  const newDrugs = req.body; // Mảng thuốc từ Excel
  if (!Array.isArray(newDrugs)) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
  writeData(newDrugs);
  res.json({ message: "Import thành công", count: newDrugs.length });
});

// 3. Thêm mới một thuốc (POST)
app.post("/api/drugs", (req, res) => {
  const newDrug = req.body;
  const drugs = readData();
  drugs.unshift(newDrug); // Thêm vào đầu danh sách
  writeData(drugs);
  res.json(newDrug);
});

// 4. Cập nhật thuốc (PUT)
app.put("/api/drugs/:id", (req, res) => {
  const { id } = req.params;
  const updatedInfo = req.body;
  let drugs = readData();

  // Tìm và update
  const index = drugs.findIndex((d) => String(d.id) === String(id));
  if (index !== -1) {
    drugs[index] = { ...drugs[index], ...updatedInfo };
    writeData(drugs);
    res.json(drugs[index]);
  } else {
    res.status(404).json({ message: "Không tìm thấy thuốc" });
  }
});

// 5. Xóa thuốc (DELETE)
app.delete("/api/drugs/:id", (req, res) => {
  const { id } = req.params;
  let drugs = readData();
  const newDrugs = drugs.filter((d) => String(d.id) !== String(id));

  if (drugs.length !== newDrugs.length) {
    writeData(newDrugs);
    res.json({ message: "Đã xóa thành công" });
  } else {
    res.status(404).json({ message: "Không tìm thấy thuốc để xóa" });
  }
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Database file: ${DB_FILE}`);
});
