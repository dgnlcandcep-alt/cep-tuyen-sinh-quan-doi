# Trỏ quandoi.dgnlqda.vn từ TENTEN sang Render

Chỉ làm sau khi Web Service đã deploy thành công và Render cấp URL dạng `ten-service.onrender.com`.

1. Render -> service CEP -> Settings -> Custom Domains -> Add Custom Domain.
2. Nhập `quandoi.dgnlqda.vn`.
3. TENTEN -> DNS của `dgnlqda.vn` -> Thêm bản ghi:
   - Loại: CNAME
   - Tên: `quandoi`
   - Tên miền đích: chính xác hostname `*.onrender.com` mà Render cấp, không thêm `https://`.
4. Quay lại Render -> Verify.
5. Sau khi SSL hoạt động, đổi `PUBLIC_BASE_URL=https://quandoi.dgnlqda.vn`.
