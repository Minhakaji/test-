#!/usr/bin/env bash
# tests/api.test.sh
# Script curl kiem tra tuan tu toan bo cac tinh huong trong bang yeu cau
# cua de bai. Chay: `bash tests/api.test.sh` (server phai dang chay san
# o BASE_URL, mac dinh http://localhost:3000).
#
# Luu y: day khong phai unit test tu dong (khong assert pass/fail),
# ma la tap lenh de tu quan sat output thuc te, dung nhu de bai cho phep.

set -uo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="user_$(date +%s)@example.com"
PASSWORD="matkhaudungB123"
WRONG_PASSWORD="matkhausaiZZZ"

hr() { printf '\n============================================================\n%s\n============================================================\n' "$1"; }

hr "1) Dang ky voi email chua ton tai, du lieu hop le -> mong doi 201"
curl -s -i -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

hr "2) Dang ky lai voi email da ton tai -> mong doi 409"
curl -s -i -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

hr "2b) Gui 5 request dang ky CUNG EMAIL gan nhu dong thoi -> chi 1 thanh cong (201), con lai 409"
RACE_EMAIL="race_$(date +%s)@example.com"
for i in 1 2 3 4 5; do
  curl -s -o "/tmp/race_$i.json" -w "request $i -> HTTP %{http_code}\n" \
    -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$RACE_EMAIL\",\"password\":\"$PASSWORD\"}" &
done
wait
echo "--- Noi dung response cua tung request ---"
for i in 1 2 3 4 5; do echo "[$i] $(cat /tmp/race_$i.json)"; done

hr "3) Dang nhap dung email va mat khau -> mong doi 200 + token"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch(e){console.log('')}})")
echo "Token nhan duoc: $TOKEN"

hr "4) Dang nhap voi mat khau sai -> mong doi 401, khong co token"
curl -s -i -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$WRONG_PASSWORD\"}"

hr "5) Goi GET /me kem token hop le -> mong doi 200 + dung thong tin tai khoan"
curl -s -i "$BASE_URL/me" -H "Authorization: Bearer $TOKEN"

hr "6) Goi GET /me KHONG kem token -> mong doi 401"
curl -s -i "$BASE_URL/me"

hr "6b) Goi GET /me voi token sai -> mong doi 401"
curl -s -i "$BASE_URL/me" -H "Authorization: Bearer token.sai.abc"

hr "7) GET /products?status=con_hang kem token hop le -> mong doi 200, chi san pham con_hang"
curl -s -i "$BASE_URL/products?status=con_hang" -H "Authorization: Bearer $TOKEN"

hr "8) GET /products KHONG kem token -> mong doi 401"
curl -s -i "$BASE_URL/products?status=con_hang"

hr "9) GET /products voi status khong hop le -> mong doi 400, khong tra danh sach rong im lang"
curl -s -i "$BASE_URL/products?status=khong_ton_tai" -H "Authorization: Bearer $TOKEN"

hr "10) Dang nhap sai mat khau 5 lan lien tiep, sau do thu lai voi mat khau DUNG -> mong doi van bi chan (429)"
LOCK_EMAIL="lock_$(date +%s)@example.com"
curl -s -o /dev/null -X POST "$BASE_URL/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$LOCK_EMAIL\",\"password\":\"$PASSWORD\"}"

for i in 1 2 3 4 5; do
  echo "-- Lan sai thu $i --"
  curl -s -i -X POST "$BASE_URL/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$LOCK_EMAIL\",\"password\":\"$WRONG_PASSWORD\"}"
  echo
done

echo "-- Thu lai voi MAT KHAU DUNG ngay sau do, ky vong van bi chan (429) --"
curl -s -i -X POST "$BASE_URL/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$LOCK_EMAIL\",\"password\":\"$PASSWORD\"}"

hr "Hoan tat."
