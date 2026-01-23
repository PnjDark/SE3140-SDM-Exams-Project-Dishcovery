const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env from server directory
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

class DatabaseSetup {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3308
    };
    this.dbName = process.env.DB_NAME || 'dishcovery';
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Connected to MySQL server');
    } catch (error) {
      console.error('❌ Failed to connect to MySQL:', error.message);
      throw error;
    }
  }

  async createDatabase() {
    try {
      await this.connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.dbName}\``);
      await this.connection.query(`USE \`${this.dbName}\``);
      console.log(`✅ Database '${this.dbName}' ready`);
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // USERS TABLE
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('customer', 'owner', 'admin') DEFAULT 'customer',
        avatar_url VARCHAR(500),
        bio TEXT,
        location VARCHAR(100),
        preferences JSON,
        is_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // RESTAURANTS TABLE
      `CREATE TABLE IF NOT EXISTS restaurants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        cuisine VARCHAR(50),
        location VARCHAR(100),
        address TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        price_range INT DEFAULT 3 CHECK (price_range BETWEEN 1 AND 5),
        description TEXT,
        owner_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        is_approved BOOLEAN DEFAULT FALSE,
        contact_phone VARCHAR(20),
        contact_email VARCHAR(100),
        website VARCHAR(200),
        opening_hours JSON,
        social_links JSON,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        featured_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FULLTEXT idx_restaurant_search (name, cuisine, description, location),
        INDEX idx_owner (owner_id),
        INDEX idx_location (latitude, longitude),
        INDEX idx_cuisine (cuisine),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // DISHES TABLE
      `CREATE TABLE IF NOT EXISTS dishes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        restaurant_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_vegan BOOLEAN DEFAULT FALSE,
        is_gluten_free BOOLEAN DEFAULT FALSE,
        is_spicy BOOLEAN DEFAULT FALSE,
        is_popular BOOLEAN DEFAULT FALSE,
        image_url VARCHAR(500),
        calories INT,
        preparation_time INT,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FULLTEXT idx_dish_search (name, description),
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_category (category),
        INDEX idx_price (price),
        INDEX idx_available (is_available),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // REVIEWS TABLE
      `CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        restaurant_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        dish_id INT,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        images JSON,
        helpful_count INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_restaurant (user_id, restaurant_id),
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_user (user_id),
        INDEX idx_dish (dish_id),
        INDEX idx_rating (rating),
        INDEX idx_created (created_at),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // RESTAURANT OWNERS TABLE
      `CREATE TABLE IF NOT EXISTS restaurant_owners (
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        role ENUM('owner', 'manager', 'staff') DEFAULT 'owner',
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, restaurant_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // USER FOLLOWS TABLE
      `CREATE TABLE IF NOT EXISTS user_follows (
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // RESTAURANT FOLLOWS TABLE
      `CREATE TABLE IF NOT EXISTS restaurant_follows (
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, restaurant_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // DISH LIKES TABLE
      `CREATE TABLE IF NOT EXISTS dish_likes (
        user_id INT NOT NULL,
        dish_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, dish_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // SAVED DISHES TABLE
      `CREATE TABLE IF NOT EXISTS saved_dishes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        dish_id INT NOT NULL,
        folder VARCHAR(100) DEFAULT 'Favorites',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_dish (dish_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // ORDERS TABLE (for future e-commerce)
      `CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_address TEXT,
        special_instructions TEXT,
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        estimated_time TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // ORDER ITEMS TABLE
      `CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        dish_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (order_id),
        INDEX idx_dish (dish_id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      // POSTS TABLE
      `CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        restaurant_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('menu_update', 'announcement', 'event', 'promotion', 'story') DEFAULT 'menu_update',
        title VARCHAR(200),
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        is_published BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_user (user_id),
        INDEX idx_type (type),
        INDEX idx_published (is_published),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    console.log('📊 Creating tables...');
    for (let i = 0; i < tables.length; i++) {
      try {
        await this.connection.execute(tables[i]);
        console.log(`  ✅ Table ${i + 1} created`);
      } catch (error) {
        console.error(`  ❌ Failed to create table ${i + 1}:`, error.message);
      }
    }
    console.log('✅ All tables created');
  }

  async seedData() {
    console.log('🌱 Seeding sample data...');
    
    // Hash for 'password123'
    const passwordHash = '$2a$10$s7J2p.ZN7E6c3h8Lq5VQeO9Qk2fY1wR3tT4uV5xW6yZ7A8B9C0D1E2F3G';
    
    const seedQueries = [
      // Insert sample users
      `INSERT IGNORE INTO users (email, password_hash, name, role, location, latitude, longitude) VALUES
      ('admin@dishcovery.com', '${passwordHash}', 'System Admin', 'admin', 'Downtown', 40.7128, -74.0060),
      ('owner1@dishcovery.com', '${passwordHash}', 'Chef Giovanni', 'owner', 'Little Italy', 40.7189, -73.9970),
      ('owner2@dishcovery.com', '${passwordHash}', 'Sushi Master Ken', 'owner', 'East Village', 40.7282, -73.9849),
      ('owner3@dishcovery.com', '${passwordHash}', 'Spice Queen Priya', 'owner', 'Murray Hill', 40.7476, -73.9805),
      ('customer1@dishcovery.com', '${passwordHash}', 'Foodie Alex', 'customer', 'Chelsea', 40.7465, -74.0014),
      ('customer2@dishcovery.com', '${passwordHash}', 'Reviewer Sam', 'customer', 'Greenwich', 40.7336, -74.0002);`,

      // Insert sample restaurants
      `INSERT IGNORE INTO restaurants (name, cuisine, location, address, rating, price_range, description, owner_id, latitude, longitude, is_approved, is_active) VALUES
      ('Mama Mia Italian', 'Italian', 'Little Italy', '123 Mulberry St, New York, NY 10013', 4.5, 3, 'Authentic Italian cuisine with wood-fired pizzas', 2, 40.7189, -73.9970, TRUE, TRUE),
      ('Tokyo Sushi', 'Japanese', 'East Village', '456 2nd Ave, New York, NY 10003', 4.7, 4, 'Fresh sushi and Japanese specialties', 3, 40.7282, -73.9849, TRUE, TRUE),
      ('Spice Kingdom', 'Indian', 'Murray Hill', '789 Lexington Ave, New York, NY 10016', 4.2, 2, 'Traditional Indian dishes with modern twist', 4, 40.7476, -73.9805, TRUE, TRUE),
      ('El Mariachi', 'Mexican', 'Hell''s Kitchen', '321 9th Ave, New York, NY 10001', 4.0, 1, 'Vibrant Mexican street food', 2, 40.7614, -73.9940, TRUE, TRUE),
      ('Le French Cafe', 'French', 'West Village', '654 Bleecker St, New York, NY 10014', 4.3, 3, 'French pastries and coffee', 3, 40.7336, -74.0002, TRUE, TRUE);`,

      // Insert restaurant owners
      `INSERT IGNORE INTO restaurant_owners (user_id, restaurant_id, role) VALUES
      (2, 1, 'owner'),
      (2, 4, 'owner'),
      (3, 2, 'owner'),
      (3, 5, 'owner'),
      (4, 3, 'owner');`,

      // Insert sample dishes
      `INSERT IGNORE INTO dishes (restaurant_id, name, description, price, category, is_vegetarian, is_spicy) VALUES
      (1, 'Margherita Pizza', 'Classic tomato, fresh mozzarella, basil', 14.99, 'Pizza', TRUE, FALSE),
      (1, 'Spaghetti Carbonara', 'Pasta with eggs, pecorino cheese, pancetta', 16.50, 'Pasta', FALSE, FALSE),
      (1, 'Tiramisu', 'Coffee-flavored Italian dessert', 8.99, 'Dessert', TRUE, FALSE),
      (2, 'Salmon Sushi Roll', 'Fresh salmon with avocado and cucumber', 12.99, 'Sushi', FALSE, FALSE),
      (2, 'Tempura Udon', 'Hot noodle soup with tempura shrimp', 14.50, 'Noodles', FALSE, FALSE),
      (2, 'Miso Soup', 'Traditional Japanese soup', 3.99, 'Soup', TRUE, FALSE),
      (3, 'Butter Chicken', 'Creamy tomato curry with tender chicken', 18.99, 'Curry', FALSE, TRUE),
      (3, 'Vegetable Biryani', 'Spiced rice with mixed vegetables', 15.50, 'Rice Dish', TRUE, TRUE),
      (3, 'Garlic Naan', 'Soft bread with garlic butter', 3.99, 'Bread', TRUE, FALSE),
      (4, 'Beef Tacos', 'Three soft tacos with seasoned beef', 11.99, 'Tacos', FALSE, TRUE),
      (4, 'Guacamole', 'Fresh avocado dip with chips', 7.99, 'Appetizer', TRUE, FALSE),
      (4, 'Churros', 'Cinnamon sugar pastries', 5.99, 'Dessert', TRUE, FALSE),
      (5, 'Croissant', 'Freshly baked butter croissant', 3.50, 'Pastry', TRUE, FALSE),
      (5, 'Quiche Lorraine', 'Savory pie with bacon and cheese', 9.99, 'Main Course', FALSE, FALSE),
      (5, 'Creme Brulee', 'Classic French dessert', 7.99, 'Dessert', TRUE, FALSE);`,

      // Insert sample reviews
      `INSERT IGNORE INTO reviews (restaurant_id, user_id, user_name, comment, rating) VALUES
      (1, 5, 'Foodie Alex', 'Best pizza in town! The crust is perfect.', 5),
      (1, 6, 'Reviewer Sam', 'Carbonara was good but a bit salty for my taste.', 3),
      (2, 5, 'Foodie Alex', 'Fresh fish, excellent quality. Will return!', 5),
      (2, 6, 'Reviewer Sam', 'Sushi was good but pricey.', 4),
      (3, 5, 'Foodie Alex', 'Authentic flavors, loved the butter chicken!', 5),
      (3, 6, 'Reviewer Sam', 'Great food but service was slow.', 4);`,

      // Insert restaurant follows
      `INSERT IGNORE INTO restaurant_follows (user_id, restaurant_id) VALUES
      (5, 1), (5, 2), (5, 3),
      (6, 2), (6, 5);`
    ];

    for (let i = 0; i < seedQueries.length; i++) {
      try {
        await this.connection.execute(seedQueries[i]);
        console.log(`  ✅ Seed ${i + 1} inserted`);
      } catch (error) {
        console.error(`  ⚠️ Seed ${i + 1} skipped:`, error.message);
      }
    }
    
    console.log('✅ Sample data seeded');
  }

  async run() {
    try {
      console.log('🚀 Starting database setup...');
      await this.connect();
      await this.createDatabase();
      await this.createTables();
      await this.seedData();
      console.log('🎉 Database setup completed successfully!');
    } catch (error) {
      console.error('💥 Database setup failed:', error);
    } finally {
      if (this.connection) {
        await this.connection.end();
        console.log('👋 Database connection closed');
      }
      process.exit(0);
    }
  }
}

// Run the setup
const dbSetup = new DatabaseSetup();
dbSetup.run();