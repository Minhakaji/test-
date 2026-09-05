// src/services/token.service.js
// Boc tach logic tao JWT rieng ra, de sau nay neu doi sang loai token
// khac (vi du random opaque token luu trong DB) chi can sua o day.
const jwt = require('jsonwebtoken');
const config = require('../config');

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

module.exports = { issueToken };
