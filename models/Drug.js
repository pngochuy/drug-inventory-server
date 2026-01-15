const mongoose = require("mongoose");

// Định nghĩa cấu trúc dữ liệu
const drugSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true, // Đảm bảo ID không trùng
    },
    TenDP: {
      type: String,
      required: true,
    },
    DVT: {
      type: String,
      required: true,
    },
    TonHT: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Tự động thêm ngày tạo/ngày sửa
  }
);

module.exports = mongoose.model("Drug", drugSchema);
