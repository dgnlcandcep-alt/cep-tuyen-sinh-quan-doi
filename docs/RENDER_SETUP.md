# Deploy CEP lên Render

1. Giải nén ZIP và đưa toàn bộ nội dung thư mục repo lên GitHub (không upload nguyên ZIP nếu muốn Render build trực tiếp).
2. Render Dashboard -> New -> Blueprint -> chọn repo GitHub này. Render đọc `render.yaml` để tạo Web Service và PostgreSQL.
3. Khi Render hỏi biến bí mật, nhập:
   - `GOOGLE_CLIENT_ID`: OAuth 2.0 Client ID loại Web application.
   - `CEP_ADMIN_EMAILS`: email Gmail của CEP được phép quản trị, phân tách bằng dấu phẩy.
   - `PUBLIC_BASE_URL`: ban đầu có thể là URL `https://<service>.onrender.com`; sau khi gắn domain đổi thành `https://quandoi.dgnlqda.vn`.
4. `SESSION_SECRET` và `DATABASE_URL` được Blueprint sinh/cấp tự động.
5. Chờ `/healthz` trả `{"ok":true}`.
6. Test đăng nhập Gmail, gửi tin, ẩn/hiện/xóa tin bằng tài khoản CEP.

Render yêu cầu web service bind `0.0.0.0` và port từ biến `PORT`; `src/server.js` đã làm sẵn.
