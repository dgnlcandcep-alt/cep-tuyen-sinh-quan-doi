# Migration status

## Hoàn thành
- Node/Express Web Service trên Render.
- PostgreSQL, migration tự chạy lúc start.
- Google ID token verification ở server.
- Quyền CEP theo `CEP_ADMIN_EMAILS` ở server, không dựa vào tên hiển thị.
- Ẩn/hiện/xóa tin nhắn; ẩn/bỏ ẩn học sinh.
- Frontend CEP responsive với tra cứu trường, sức khỏe, QDA, khóa học, nguồn và chat.
- Express 5 SPA fallback dùng `/{*splat}` để chạy trên Render.

## Cần cấu hình ngoài mã nguồn
- `GOOGLE_CLIENT_ID` trong Render.
- Google Authorized JavaScript origin cho domain Render và custom domain.
- Custom domain ở Render + CNAME ở TENTEN.

## Giới hạn dữ liệu khôi phục
Bản frontend cũ trên ChatGPT Sites không còn trong filesystem lúc đóng gói Render FULL. Bản này không đoán các bảng chi tiết bị mất; sử dụng những mốc đã xác minh và link nguồn gốc để đối chiếu.
