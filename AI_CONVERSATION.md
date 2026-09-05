# Hội thoại AI đã sử dụng

Công cụ AI: Claude (Anthropic), dùng trong toàn bộ quá trình dựng backend cho bài test.

---

## Prompt 1
"Bạn là kỹ sư Backend. Đây là đề bài kiểm tra đầu vào (file đính kèm). Trước khi code, hãy đề xuất 2–3 hướng tiếp cận khác nhau để giải quyết bài toán (ví dụ: cách xử lý chống trùng email khi đăng ký đồng thời — dùng ràng buộc UNIQUE ở DB vs. dùng lock/mutex ở tầng ứng dụng vs. dùng transaction với isolation level; cách chống dò mật khẩu — đếm trong bộ nhớ vs. lưu DB vs. dùng thư viện rate-limit có sẵn), nêu rõ ưu/nhược điểm mỗi hướng, rồi chọn 1 hướng và giải thích lý do trước khi triển khai.

Sau khi thống nhất hướng đi, hãy xây dựng đầy đủ 4 endpoint theo đúng yêu cầu và bảng test case trong đề, ưu tiên đúng 100% các tình huống: chống trùng email khi đăng ký đồng thời, chống dò mật khẩu sau 5 lần sai, hash mật khẩu, JWT có hạn.

Yêu cầu về kỹ thuật:

Dùng Node.js + Express + SQLite (không cần DB ngoài để dễ chạy thử).
Tổ chức code theo layer rõ ràng: routes → controllers → services, tách middleware xác thực/xử lý lỗi riêng.
Comment giải thích các đoạn logic khó (đặc biệt là 2 điểm race-condition và lockout) — vì khi phỏng vấn tôi cần giải thích được từng dòng.

Yêu cầu về bàn giao:

Cấu trúc thư mục gọn để mở thẳng bằng VS Code.
Khởi tạo sẵn Git repo, chia commit theo từng tính năng nhỏ (không gộp hết vào 1 commit), message commit rõ ràng bằng tiếng Việt hoặc tiếng Anh có convention (feat/fix/docs...) để tôi push lên GitHub và người review đọc log dễ theo dõi.
Kèm README hướng dẫn cách chạy, cách test (curl hoặc test tự động), và ghi rõ phần nào tôi chưa kịp hoàn thiện nếu có.
Xuất ra file nén tôi có thể tải về, giải nén và chạy npm install && npm start ngay."

**Tóm tắt trả lời của AI:**

AI đọc đề bài từ file docx, xác định yêu cầu chính: 4 endpoint (`/register`, `/login`,
`/me`, `/products`), 2 điểm kỹ thuật khó là (1) chống tạo trùng tài khoản khi 2 request
đăng ký cùng email gửi đồng thời, và (2) chống dò mật khẩu (khoá tạm sau 5 lần sai
liên tiếp). Sau đó AI chọn stack **Node.js + Express + SQLite (better-sqlite3) +
bcryptjs + jsonwebtoken** và dựng toàn bộ dự án theo kiến trúc layer:

```
routes -> controllers -> services -> db
```

kèm middleware xác thực JWT (`authMiddleware.js`) và middleware bắt lỗi tập trung
(`errorHandler.js`).

Hai quyết định kỹ thuật quan trọng AI đưa ra và giải thích rõ trong code:

1. **Chống race-condition khi đăng ký trùng email**: thay vì "SELECT kiểm tra tồn tại
   rồi mới INSERT" (có khoảng hở giữa 2 bước, 2 request có thể cùng lúc thấy email
   "chưa tồn tại"), AI cho INSERT thẳng vào bảng `users` có ràng buộc `UNIQUE(email)`
   ở tầng SQLite. Vì `better-sqlite3` chạy đồng bộ (không xen kẽ giữa 2 lệnh insert),
   request nào insert trước sẽ thắng, request sau nhận lỗi `SQLITE_CONSTRAINT_UNIQUE`
   và bị trả về 409 rõ ràng — đúng yêu cầu "chỉ 1 tài khoản được tạo, các request còn
   lại bị từ chối rõ ràng".

2. **Chống dò mật khẩu**: mỗi lần đăng nhập (đúng/sai) được ghi vào bảng
   `login_attempts`. Trước khi xác thực mật khẩu, hệ thống đếm số lần sai liên tiếp
   trong 1 phút gần nhất; nếu đạt 5 lần, các lần thử tiếp theo bị chặn 429 trong 1
   phút kế tiếp — kể cả khi lần thử đó dùng đúng mật khẩu.

AI cũng tạo sẵn: script `tests/api.test.sh` (curl bao phủ đúng bảng test case trong
đề, gồm cả gửi 5 request đăng ký song song để chứng minh chống trùng email), file
`tests/requests.http` để test nhanh bằng VS Code REST Client, README giải thích cách
chạy/test và các quyết định thiết kế, và khởi tạo sẵn Git repo với 13 commit tách
theo từng luồng tính năng (config → DB → seed data → utils → middleware → service →
controllers → routes → app → test → docs) để dễ review trên GitHub.

**Đã chỉnh sửa/giữ nguyên gì và vì sao:**

- Giữ nguyên toàn bộ kiến trúc và logic race-condition / lockout vì đã đúng yêu cầu
  đề bài và mình hiểu rõ cách hoạt động (dùng UNIQUE constraint + đếm attempts trong
  cửa sổ thời gian) để có thể giải thích khi phỏng vấn.
- Tự chạy lại `npm install && npm start` và `bash tests/api.test.sh` trên máy thật
  (sandbox của AI không có mạng nên AI chỉ kiểm tra được cú pháp bằng `node --check`,
  chưa chạy thực tế) — dán kết quả output thật vào phần dưới nếu cần nộp kèm.

---
