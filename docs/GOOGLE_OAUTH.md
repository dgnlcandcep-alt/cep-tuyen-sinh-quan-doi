# Google OAuth cho phòng hỏi đáp

Tạo OAuth 2.0 Client ID loại Web application trong Google Cloud Console.

Authorized JavaScript origins nên có cả URL Render trong giai đoạn test và domain chính thức:
- `https://<service>.onrender.com`
- `https://quandoi.dgnlqda.vn`

Ứng dụng frontend dùng Google Identity Services ID token; máy chủ xác minh token bằng `google-auth-library`. Học sinh chỉ được chat khi email đã xác minh và là Gmail; các email trong `CEP_ADMIN_EMAILS` có thể được phép quản trị.

Không commit Client Secret, refresh token hoặc mật khẩu Google vào GitHub.
