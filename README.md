# CEP · Cổng tra cứu tuyển sinh Quân đội — Render FULL

Bản triển khai Render đầy đủ giao diện và backend hỏi đáp CEP.

## Có gì trong gói này

- Frontend responsive, cỡ chữ lớn, tông xanh quân đội dễ đọc.
- Tra cứu và lưu/so sánh trường.
- Trang điểm chuẩn 2026, các mốc đã xác minh và link nguồn chính thức.
- Công cụ tính điểm ưu tiên tham khảo và tra mốc quy đổi đã xác minh.
- Sức khỏe: **Thông tư 105/2023/TT-BQP là văn bản gốc**; **Thông tư 106/2025/TT-BQP chỉ áp dụng vào đúng nội dung sửa đổi/bổ sung**. Không coi TT106 là văn bản thay thế toàn bộ TT105.
- Hướng dẫn sơ tuyển, QDA, khóa QDA 2027 và kênh truyền thông CEP.
- Phòng hỏi đáp dùng Gmail/Google Identity Services + PostgreSQL. CEP có quyền ẩn/hiện/xóa tin và ẩn học sinh.

## Quan trọng về dữ liệu khôi phục

Môi trường build của bản ChatGPT Sites cũ đã bị dọn trước khi xuất source 1:1. Vì vậy bản Render FULL này **khôi phục toàn bộ cấu trúc giao diện và chức năng chính**, nhưng **không tự bịa những dòng bảng chi tiết chưa lấy lại được**. Các mục đó được dẫn về văn bản/nguồn chính thức.

Các mốc có trong bản này gồm dữ liệu đã kiểm chứng như tổng chỉ tiêu 2026, nguyên tắc 4 phương thức, khoảng điểm sàn, mốc QDA 126/150 → 29,75 A00 và điểm HV Kỹ thuật Quân sự đã công bố. Muốn phục hồi 1:1 mọi dòng của bảng quy đổi/điểm chuẩn cũ, cần nhập lại dữ liệu từ file nguồn.

## Deploy lên Render

Repo đã có `render.yaml` để tạo:

- Web Service `cep-quan-doi`
- PostgreSQL `cep-quan-doi-db`
- `DATABASE_URL` tự nối
- `SESSION_SECRET` tự sinh

Các biến cần cấu hình:

- `CEP_ADMIN_EMAILS`: Gmail/email Google của CEP được cấp quyền admin; nhiều email cách nhau bằng dấu phẩy.
- `GOOGLE_CLIENT_ID`: Google OAuth Web Client ID để bật đăng nhập Gmail.
- `PUBLIC_BASE_URL`: `https://quandoi.dgnlqda.vn`

Render build/start:

```bash
npm install
npm run render-start
```

## Upload đè repo GitHub hiện tại

Giải nén ZIP. Trong repo `cep-tuyen-sinh-quan-doi`, upload **toàn bộ nội dung bên trong gói** và chọn ghi đè các file trùng tên. Commit vào `main`; Render sẽ Auto-Deploy.

## Custom domain

Sau khi bản FULL chạy ổn:

- Render → Settings → Custom Domains → `quandoi.dgnlqda.vn`
- TENTEN DNS: CNAME `quandoi` → `cep-quan-doi.onrender.com` (hoặc target Render hiển thị nếu khác)
- Google OAuth Authorized JavaScript origins: thêm `https://quandoi.dgnlqda.vn`

## Nguồn chính

- Điểm chuẩn 2026: Chính phủ / Ban Tuyển sinh quân sự.
- Quy đổi: Công văn 4078/TSQS-QHNT.
- Sức khỏe: TT105/2023/TT-BQP + đúng phần sửa đổi của TT106/2025/TT-BQP.
