# Trạng thái gói này

Gói này là **Render/GitHub migration starter**, tập trung vào hạ tầng Render, PostgreSQL, Google login và phòng hỏi đáp CEP.

Nó **không phải bản export 1:1 của toàn bộ frontend/data đang chạy trên ChatGPT Sites**. Phiên làm việc hiện tại không có bản source tree đã deploy để đóng gói trực tiếp. Khi có bản export/frontend hiện tại, chép/merge các file giao diện, dữ liệu JSON và tài liệu vào `public/`, giữ nguyên `src/server.js`, `db/`, `scripts/`, `render.yaml` và các API `/api/*`.

Không đưa dữ liệu chat thật, cookie, token hoặc credential vào repo.
