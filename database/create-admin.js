const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config({ path: '../server/.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function createAdmin() {
  try {
    console.log('\n🔐 Create Admin User\n');

    const email = await question('📧 Enter admin email: ');
    const name = await question('👤 Enter admin name: ');
    const password = await question('🔑 Enter admin password: ');

    if (!email || !name || !password) {
      console.log('\n❌ All fields are required!\n');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      console.log('\n❌ User with this email already exists!\n');
      await connection.end();
      rl.close();
      return;
    }

    // Insert admin user
    const [result] = await connection.execute(
      `INSERT INTO users (email, password_hash, name, role, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', TRUE, NOW(), NOW())`,
      [email, hashedPassword, name]
    );

    console.log('\n✅ Admin user created successfully!\n');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔐 Role: admin`);
    console.log(`\n🔗 Login at: http://localhost:3000/login\n`);

    await connection.end();
    rl.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    rl.close();
    process.exit(1);
  }
}

createAdmin();
