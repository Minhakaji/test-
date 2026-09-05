// src/index.js
const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Server dang chay tai http://localhost:${config.port}`);
});
