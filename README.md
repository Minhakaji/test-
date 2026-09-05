# Auth API — Đăng ký / Đăng nhập cơ bản

API cho bài kiểm tra Backend Developer: đăng ký, đăng nhập, và 2 endpoint được bảo vệ bằng token (`/me`, `/products`).

**Ngôn ngữ / framework:** Node.js + Express + SQLite (`better-sqlite3`).

## Vì sao chọn stack này

- **Express**: nhẹ, đủ dùng cho 4 endpoint, dễ đọc dễ review.
- **SQLite (better-sqlite3)**: không cần cài đặt server DB riêng, chạy được ngay bằng 1 file. Quan trọng hơn: `better-sqlite3` là thư viện **đồng bộ**, cộng với ràng buộc `UNIQUE(email)` ở tầng DB, giúp xử lý đúng race-condition khi 2 request đăng ký cùng email gửi gần như đồng thời (xem giải thích chi tiết trong `src/services/user.service.js`).
- **bcryptjs**: hash mật khẩu một chiều, không lưu plain text.
- **jsonwebtoken**: cấp JWT có thời hạn (`JWT_EXPIRES_IN`, mặc định 1h).

## Cấu trúc thư mục

```
src/
  config.js                  # đọc .env một chỗ duy nhất
  app.js                     # lắp ráp Express app
  index.js                   # entry point, listen port
  db/
    index.js                 # kết nối SQLite + chạy migration
    migrations.sql           # schema bảng users, login_attempts
  data/
    products.seed.js         # danh sách sản phẩm mẫu (seed cứng)
  middleware/
    authMiddleware.js        # kiểm tra JWT ở header Authorization
    errorHandler.js          # bắt lỗi tập trung
  services/
    user.service.js          # đăng ký / tìm user / verify mật khẩu
    token.service.js         # cấp JWT
    loginAttempt.service.js  # chống dò mật khẩu (lockout)
    product.service.js       # lọc sản phẩm theo status
  controllers/
    auth.controller.js
    account.controller.js
    products.controller.js
  routes/
    auth.routes.js
    account.routes.js
    products.routes.js
    index.js
tests/
  api.test.sh                # script curl test tất cả tình huống trong đề bài
  requests.http              # file test nhanh cho VS Code REST Client
```

## Cách chạy

```bash
npm install
cp .env.example .env    # chỉnh JWT_SECRET nếu muốn
npm start                # hoặc: npm run dev (auto-restart khi sửa code)
```

Server mặc định chạy ở `http://localhost:3000`. File SQLite tự tạo tại `data/app.sqlite` khi chạy lần đầu.

## Cách test

**Cách 1 — script curl có sẵn** (bao phủ đúng bảng tình huống trong đề bài, kể cả test race-condition bằng 5 request song song và test lockout sau 5 lần sai):

```bash
npm start &            # chạy server nền
bash tests/api.test.sh
```

**Cách 2 — VS Code REST Client**: mở `tests/requests.http`, bấm "Send Request" trên từng khối.

**Cách 3 — curl thủ công**, ví dụ:

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@example.com","password":"matkhau123"}'
```

## Endpoint

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/register` | không | Tạo tài khoản. 400 nếu sai định dạng/mật khẩu ngắn, 409 nếu email đã tồn tại |
| POST | `/login` | không | Trả JWT nếu đúng. 401 nếu sai. 429 nếu đang bị khoá do dò mật khẩu |
| GET | `/me` | có (Bearer token) | Thông tin tài khoản của token đang dùng |
| GET | `/products?status=...` | có (Bearer token) | Danh sách sản phẩm theo trạng thái. 400 nếu status không hợp lệ |

Trạng thái sản phẩm hợp lệ: `con_hang`, `het_hang`, `ngung_ban` (định nghĩa trong `src/data/products.seed.js`).

## Các quyết định thiết kế đáng chú ý

1. **Chống trùng email khi đăng ký đồng thời**: không dùng cách "SELECT kiểm tra rồi INSERT" vì vẫn có khoảng hở giữa 2 bước. Thay vào đó INSERT thẳng và dựa vào ràng buộc `UNIQUE(email)` của SQLite — bên nào insert trước thắng, bên sau nhận lỗi `SQLITE_CONSTRAINT_UNIQUE` và bị từ chối rõ ràng (409). `better-sqlite3` chạy đồng bộ nên 2 lệnh insert không bao giờ xen kẽ nhau.
2. **Chống dò mật khẩu (brute-force)**: mỗi lần đăng nhập (đúng/sai) được ghi vào bảng `login_attempts`. Khi có ≥ 5 lần sai liên tiếp trong 1 phút gần nhất, các lần thử tiếp theo bị chặn (429) trong 1 phút kế tiếp — **kể cả khi nhập đúng mật khẩu** — đúng theo yêu cầu đề bài. Cấu hình được qua `.env` (`LOGIN_MAX_ATTEMPTS`, `LOGIN_WINDOW_MS`, `LOGIN_LOCKOUT_MS`).
3. **Mật khẩu**: hash bằng bcrypt (`bcryptjs`), không bao giờ lưu hay trả về plain text.
4. **Không lộ thông tin khi thiếu/sai token**: `/me` và `/products` luôn trả 401 chung chung, không phân biệt "token sai" hay "user không tồn tại" để tránh dò thông tin.

## Phần chưa hoàn thiện / giới hạn đã biết

- Chưa viết unit test tự động (Jest/Mocha) — dùng script curl (`tests/api.test.sh`) để kiểm tra thủ công theo đúng bảng yêu cầu, vì đề bài cho phép chọn 1 trong 2 cách.
- Chưa có refresh token / logout (thu hồi token) — ngoài phạm vi đề bài.
- Cơ chế lockout lưu theo request gần nhất trong SQLite, đủ dùng cho 1 instance server; nếu scale nhiều instance cần chuyển sang store dùng chung (Redis).

## Hội thoại AI đã sử dụng

Xem file `AI_CONVERSATION.md` (nếu có sử dụng AI trong quá trình làm, dán prompt và câu trả lời vào đó theo đúng yêu cầu đề bài).
