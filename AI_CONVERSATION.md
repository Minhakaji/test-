# Hội thoại AI đã sử dụng

Công cụ AI: Claude (Anthropic), dùng trong toàn bộ quá trình dựng backend cho bài test.

---

## Prompt 1

```
bạn là kỹ sư be
xây dựng hệ thống trong bài trên
Định hướng các luồng chuyên nghiệp
có thể mở ở vs code và tải lên github
comt để có thể dễ review
```

(Đính kèm file đề bài `Bai-test-Backend-AI.docx`)

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

## Prompt 2

```
đánh giá promt của tôi và cho lại 1 promt hay hơn
```

**Tóm tắt trả lời của AI:**

AI chỉ ra prompt gốc còn thiếu: không nêu stack cụ thể, cụm "định hướng các luồng
chuyên nghiệp" mơ hồ (không rõ là kiến trúc code, luồng nghiệp vụ hay quy trình git),
có lỗi chính tả ("comt"), và không nêu rõ mức độ output mong muốn hay ràng buộc môi
trường (có mạng để cài package hay không). Sau đó AI đề xuất 1 prompt chi tiết hơn,
nêu rõ: phạm vi bám sát bảng test case của đề, ràng buộc kỹ thuật (Node.js + Express +
SQLite, kiến trúc layer rõ ràng, comment giải thích các đoạn logic khó), và yêu cầu
bàn giao (git repo chia commit theo tính năng, README, file nén tải về chạy được
ngay).

**Đã chỉnh sửa/giữ nguyên gì và vì sao:**

- Dùng làm tài liệu tham khảo cách viết prompt rõ ràng hơn cho các lần làm việc với
  AI sau này; không áp dụng lại để build lại project vì bản build từ Prompt 1 đã đáp
  ứng đủ yêu cầu đề bài.
