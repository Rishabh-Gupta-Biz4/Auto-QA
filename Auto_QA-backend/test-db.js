const mysql = require('mysql2');
require('dotenv').config();

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***HIDDEN***' : 'EMPTY');
console.log('DB_NAME:', process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'auto_qa_db'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error code:', err.code);
  } else {
    console.log('✅ Connected to MySQL database successfully!');
  }
  connection.end();
});
