# Website Thiệp Mời Lễ Tốt Nghiệp

## 🎓 Giới Thiệu
Website tĩnh hiện đại để gửi thiệp mời lễ tốt nghiệp với 2 trang:
1. **Trang Thiệp Mời** (graduration.html) - Card mời đẹp mắt với ảnh và thông tin sự kiện
2. **Trang Hướng Dẫn** (directions.html) - Sơ đồ và hướng dẫn đến trường

## 📁 Cấu Trúc File
```
├── graduration.html           (Trang thiệp mời)
├── directions.html            (Trang hướng dẫn)
├── README-GRADUATION.md       (File hướng dẫn này)
└── assets/
    ├── css/
    │   ├── graduation.css     (CSS cho trang thiệp mời)
    │   └── directions.css     (CSS cho trang hướng dẫn)
    └── images/
        ├── graduation-avatar.png  (Ảnh tốt nghiệp - THAY THẾ)
        └── map-template.png       (Ảnh bản đồ - THAY THẾ)
```

---

## 🖼️ HƯỚNG DẪN THAY ẢNH

### 1️⃣ Ảnh Tốt Nghiệp (Trang Thiệp Mời)

**Vị trí file:** `assets/images/graduation-avatar.png`

**Cách thay:**
- **Cách 1 (Ảnh local):** Thay file `graduation-avatar.png` bằng ảnh của bạn (giữ nguyên tên hoặc sửa trong HTML)
- **Cách 2 (Ảnh online):** Sửa trong file `graduration.html` dòng 18:
  ```html
  <img src="https://link-anh-cua-ban.com/photo.jpg" alt="Ảnh tốt nghiệp">
  ```

**Khuyến nghị:**
- Kích thước: 1200x800px hoặc tỷ lệ 3:2
- Format: JPG hoặc PNG
- Chất lượng: Cao, ánh sáng tốt, nền đẹp

---

### 2️⃣ Ảnh Bản Đồ (Trang Hướng Dẫn)

**Vị trí file:** `assets/images/map-template.png`

**Cách thay:**
- **Cách 1 (Ảnh local):** Thay file `map-template.png` bằng screenshot bản đồ của bạn
- **Cách 2 (Ảnh online):** Sửa trong file `directions.html` dòng 31:
  ```html
  <img src="https://link-ban-do-cua-ban.com/map.jpg" alt="Bản đồ">
  ```

**Khuyến nghị:**
- Screenshot từ Google Maps với marker rõ ràng
- Hoặc vẽ sơ đồ đơn giản với các mốc quan trọng
- Kích thước: 1000x600px hoặc tỷ lệ 5:3
- Đảm bảo các tên đường, địa danh rõ ràng

---

## ✏️ HƯỚNG DẪN CHỈNH SỬA THÔNG TIN

### Trang Thiệp Mời (graduration.html)

**Dòng cần sửa:**

| Dòng | Nội dung | Mô tả |
|------|----------|-------|
| 18 | `src="..."` | Đường dẫn ảnh tốt nghiệp |
| 19 | `Class of 2024` | Thay khóa học của bạn |
| 24 | `20.11.2023` | Thay ngày tốt nghiệp |
| 25-27 | `[Địa điểm]`, `[Địa chỉ]` | Thông tin địa điểm |

**Ví dụ:**
```html
<div class="class-banner">Class of 2025</div>
...
<div class="date">15.06.2025</div>
<div class="details">
    Kính mời tham dự<br>
    tại Hội trường A - Đại học ABC<br>
    123 Đường XYZ, Quận 1, TP.HCM
</div>
```

---

### Trang Hướng Dẫn (directions.html)

**Các phần cần cập nhật:**

1. **Địa chỉ trường** (dòng 14-16)
2. **Hướng dẫn di chuyển** (dòng 19-24)
3. **Ảnh bản đồ** (dòng 31)
4. **Thông tin bãi đỗ xe** (dòng 37-41)
5. **Lưu ý quan trọng** (dòng 44-50)

---

## 🎨 TÙY CHỈNH MÀU SẮC

### File CSS chính: `assets/css/graduation.css` và `assets/css/directions.css`

**Màu sắc hiện tại:**
- Xanh nước biển: `#4a90e2` (nút, tiêu đề)
- Xám đậm: `#4a4a4a` (chữ tiêu đề)
- Xám nhạt: `#6a6a6a` (banner gradient)
- Nền sáng: `#f8f8f8` (nền content)

**Để đổi màu:**
1. Mở file `assets/css/graduation.css`
2. Tìm và thay thế mã màu hex (ví dụ `#4a90e2` → `#ff6b6b` cho màu đỏ coral)
3. Lưu và refresh trình duyệt

---

## 📱 RESPONSIVE DESIGN

Website đã tối ưu cho:
- ✅ Desktop (> 768px)
- ✅ Tablet (768px)
- ✅ Mobile (< 768px)

**Thay đổi kích thước khung:**

Trong `assets/css/graduation.css`:
```css
.invite-card {
    max-width: 850px;  /* Thay đổi số này */
}
```

---

## 🚀 CÁCH SỬ DỤNG

### 1. Xem trên local:
- Mở file `graduration.html` bằng trình duyệt
- Click "Xem Hướng Dẫn Đến Trường" để chuyển trang

### 2. Deploy lên GitHub Pages:
```bash
git add .
git commit -m "Update graduation invitation"
git push origin main
```

### 3. Chia sẻ:
- Link: `https://your-username.github.io/graduration.html`
- Hoặc tạo QR code từ link

---

## 💡 MẸO THIẾT KẾ

### Ảnh tốt nghiệp đẹp:
- ✅ Chụp trong ngày tốt nghiệp hoặc chụp riêng với áo tốt nghiệp
- ✅ Ánh sáng tự nhiên, nền đẹp (khuôn viên trường)
- ✅ Góc chụp đẹp, mỉm cười tự nhiên
- ✅ Có thể thêm hiệu ứng confetti hoặc hoa bay

### Bản đồ hiệu quả:
- ✅ Zoom vừa phải, thấy được các đường xung quanh
- ✅ Đánh dấu rõ vị trí trường
- ✅ Ghi chú các landmark quan trọng
- ✅ Có thể thêm mũi tên chỉ đường

---

## 🛠️ TROUBLESHOOTING

**Ảnh không hiển thị?**
- Kiểm tra đường dẫn file có đúng không
- Kiểm tra tên file có khớp với trong code không (phân biệt hoa thường)

**CSS không áp dụng?**
- Xóa cache trình duyệt (Ctrl + F5)
- Kiểm tra đường dẫn file CSS trong HTML

**Responsive không hoạt động?**
- Đảm bảo có thẻ viewport trong `<head>`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console (F12) xem có lỗi không
2. So sánh code với file gốc
3. Đảm bảo cấu trúc thư mục đúng

---

**Chúc bạn có một lễ tốt nghiệp thật ý nghĩa! 🎓✨**
