// src/data/products.seed.js
// Danh sach san pham mau, seed cung trong code theo yeu cau de bai.
// Co it nhat 3 trang thai khac nhau de test bo loc status.

const PRODUCT_STATUS = Object.freeze({
  CON_HANG: 'con_hang', // con hang
  HET_HANG: 'het_hang', // het hang
  NGUNG_BAN: 'ngung_ban', // ngung ban
});

// Danh sach cac gia tri status hop le - dung de validate query param
const VALID_STATUSES = Object.values(PRODUCT_STATUS);

const PRODUCTS = [
  { id: 1, name: 'Ban phim co Keychron K2', status: PRODUCT_STATUS.CON_HANG, price: 1590000 },
  { id: 2, name: 'Chuot Logitech MX Master 3', status: PRODUCT_STATUS.CON_HANG, price: 2190000 },
  { id: 3, name: 'Man hinh Dell 27 inch 4K', status: PRODUCT_STATUS.CON_HANG, price: 8990000 },
  { id: 4, name: 'Tai nghe Sony WH-1000XM4', status: PRODUCT_STATUS.HET_HANG, price: 6490000 },
  { id: 5, name: 'Webcam Logitech C920', status: PRODUCT_STATUS.HET_HANG, price: 1290000 },
  { id: 6, name: 'Loa Bluetooth JBL Flip 5', status: PRODUCT_STATUS.NGUNG_BAN, price: 990000 },
  { id: 7, name: 'Sac du phong Anker 10000mAh', status: PRODUCT_STATUS.NGUNG_BAN, price: 590000 },
];

module.exports = { PRODUCT_STATUS, VALID_STATUSES, PRODUCTS };
