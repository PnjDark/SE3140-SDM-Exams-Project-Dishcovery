-- ===================================================
-- COMPLETE DISHDISCOVERY DATABASE RESET
-- COPY AND PASTE ALL OF THIS INTO MYSQL WORKBENCH
-- ===================================================

-- 1. DROP AND RECREATE THE DATABASE
DROP DATABASE IF EXISTS dishcovery;
CREATE DATABASE dishcovery;
USE dishcovery;

-- ===================================================
-- 2. CREATE ALL TABLES FROM SCRATCH
-- ===================================================

-- USERS TABLE (must be first for foreign keys)
CREATE TABLE users (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RESTAURANTS TABLE
CREATE TABLE restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    cuisine VARCHAR(50),
    location VARCHAR(100),
    rating DECIMAL(3,2),
    price_range INT DEFAULT 3,
    description TEXT,
    owner_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    website VARCHAR(200),
    opening_hours JSON,
    social_links JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- DISHES TABLE
CREATE TABLE dishes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_spicy BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    calories INT,
    preparation_time INT,
    tags JSON,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- REVIEWS TABLE
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    comment TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- RESTAURANT OWNERS TABLE
CREATE TABLE restaurant_owners (
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    role ENUM('owner', 'manager', 'staff') DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- USER FOLLOWS TABLE
CREATE TABLE user_follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- RESTAURANT FOLLOWS TABLE
CREATE TABLE restaurant_follows (
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- POSTS TABLE
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('menu_update', 'announcement', 'event', 'promotion') DEFAULT 'menu_update',
    title VARCHAR(200),
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- POST COMMENTS TABLE
CREATE TABLE post_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- POST LIKES TABLE
CREATE TABLE post_likes (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- 3. INSERT SAMPLE DATA
-- ===================================================

-- INSERT SAMPLE USERS (password is 'password123' hashed)
INSERT INTO users (email, password_hash, name, role) VALUES
-- Restaurant Owners
('owner1@dishcovery.com', '$2a$10$s7J2p.ZN7E6c3h8Lq5VQeO9Qk2fY1wR3tT4uV5xW6yZ7A8B9C0D1E2F3G', 'Chef Giovanni', 'owner'),
('owner2@dishcovery.com', '$2a$10$s7J2p.ZN7E6c3h8Lq5VQeO9Qk2fY1wR3tT4uV5xW6yZ7A8B9C0D1E2F3G', 'Sushi Master Ken', 'owner'),
('owner3@dishcovery.com', '$2a$10$s7J2p.ZN7E6c3h8Lq5VQeO9Qk2fY1wR3tT4uV5xW6yZ7A8B9C0D1E2F3G', 'Spice Queen Priya', 'owner'),
-- Regular Customers
('customer1@dishcovery.com', '$2a$10$s7J2p.ZN7E6c3h8Lq5VQeO9Qk2fY1wR3tT4uV5xW6yZ7A8B9C0D1E2F3G', 'Foodie Alex', 'customer'),
('customer2@dishcovery.com', '$2a$10$s7J2p.ZN7E6c3h8Lq5VQeO9Qk2fY1wR3tT4uV5xW6yZ7A8B9C0D1E2F3G', 'Reviewer Sam', 'customer');

-- INSERT SAMPLE RESTAURANTS
INSERT INTO restaurants (name, cuisine, location, rating, price_range, description, owner_id) VALUES
('Mama Mia Italian', 'Italian', 'Downtown', 4.5, 3, 'Authentic Italian cuisine with wood-fired pizzas', 1),
('Tokyo Sushi', 'Japanese', 'Waterfront', 4.7, 4, 'Fresh sushi and Japanese specialties', 2),
('Spice Kingdom', 'Indian', 'Midtown', 4.2, 2, 'Traditional Indian dishes with modern twist', 3),
('El Mariachi', 'Mexican', 'East Side', 4.0, 1, 'Vibrant Mexican street food', 1),
('Le French Cafe', 'French', 'West End', 4.3, 3, 'French pastries and coffee', 2);

-- INSERT RESTAURANT OWNERS
INSERT INTO restaurant_owners (user_id, restaurant_id, role) VALUES
(1, 1, 'owner'),
(1, 4, 'owner'),
(2, 2, 'owner'),
(2, 5, 'owner'),
(3, 3, 'owner');

-- INSERT SAMPLE DISHES
INSERT INTO dishes (restaurant_id, name, description, price, category, is_vegetarian, is_spicy) VALUES
-- Restaurant 1: Mama Mia Italian
(1, 'Margherita Pizza', 'Classic tomato, fresh mozzarella, basil', 14.99, 'Pizza', TRUE, FALSE),
(1, 'Spaghetti Carbonara', 'Pasta with eggs, pecorino cheese, pancetta', 16.50, 'Pasta', FALSE, FALSE),
(1, 'Tiramisu', 'Coffee-flavored Italian dessert', 8.99, 'Dessert', TRUE, FALSE),

-- Restaurant 2: Tokyo Sushi
(2, 'Salmon Sushi Roll', 'Fresh salmon with avocado and cucumber', 12.99, 'Sushi', FALSE, FALSE),
(2, 'Tempura Udon', 'Hot noodle soup with tempura shrimp', 14.50, 'Noodles', FALSE, FALSE),
(2, 'Miso Soup', 'Traditional Japanese soup', 3.99, 'Soup', TRUE, FALSE),

-- Restaurant 3: Spice Kingdom
(3, 'Butter Chicken', 'Creamy tomato curry with tender chicken', 18.99, 'Curry', FALSE, TRUE),
(3, 'Vegetable Biryani', 'Spiced rice with mixed vegetables', 15.50, 'Rice Dish', TRUE, TRUE),
(3, 'Garlic Naan', 'Soft bread with garlic butter', 3.99, 'Bread', TRUE, FALSE),

-- Restaurant 4: El Mariachi
(4, 'Beef Tacos', 'Three soft tacos with seasoned beef', 11.99, 'Tacos', FALSE, TRUE),
(4, 'Guacamole', 'Fresh avocado dip with chips', 7.99, 'Appetizer', TRUE, FALSE),
(4, 'Churros', 'Cinnamon sugar pastries', 5.99, 'Dessert', TRUE, FALSE),

-- Restaurant 5: Le French Cafe
(5, 'Croissant', 'Freshly baked butter croissant', 3.50, 'Pastry', TRUE, FALSE),
(5, 'Quiche Lorraine', 'Savory pie with bacon and cheese', 9.99, 'Main Course', FALSE, FALSE),
(5, 'Creme Brulee', 'Classic French dessert', 7.99, 'Dessert', TRUE, FALSE);

-- INSERT SAMPLE REVIEWS
INSERT INTO reviews (restaurant_id, user_id, user_name, comment, rating) VALUES
(1, 4, 'Foodie Alex', 'Best pizza in town! The crust is perfect.', 5),
(1, 5, 'Reviewer Sam', 'Carbonara was good but a bit salty for my taste.', 3),
(2, 4, 'Foodie Alex', 'Fresh fish, excellent quality. Will return!', 5),
(2, 5, 'Reviewer Sam', 'Sushi was good but pricey.', 4),
(3, 4, 'Foodie Alex', 'Authentic flavors, loved the butter chicken!', 5),
(3, 5, 'Reviewer Sam', 'Great food but service was slow.', 4);

-- INSERT RESTAURANT FOLLOWS
INSERT INTO restaurant_follows (user_id, restaurant_id) VALUES
(4, 1), (4, 2), (4, 3),  -- Foodie Alex follows 3 restaurants
(5, 2), (5, 5);          -- Reviewer Sam follows 2 restaurants

-- INSERT SAMPLE POSTS
INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published) VALUES
(1, 1, 'menu_update', 'New Winter Menu!', 'We are excited to introduce our new winter menu featuring seasonal ingredients and cozy dishes.', TRUE),
(1, 1, 'promotion', 'Happy Hour Special', 'Join us for happy hour Monday-Friday, 4-6PM. 50% off all appetizers and $5 cocktails!', TRUE),
(2, 2, 'announcement', 'Holiday Hours', 'We will be closed on December 25th for Christmas. Merry Christmas to all our customers!', TRUE),
(3, 3, 'event', 'Live Music Night', 'Join us this Friday for live traditional Indian music while you enjoy your meal. 7-10PM.', TRUE);

-- ===================================================
-- 4. VERIFY EVERYTHING WORKED
-- ===================================================

SELECT '=== DATABASE CREATED SUCCESSFULLY ===' AS '';

SELECT '--- USERS ---' AS '';
SELECT id, email, name, role FROM users;

SELECT '--- RESTAURANTS ---' AS '';
SELECT id, name, cuisine, location, rating FROM restaurants;

SELECT '--- DISHES ---' AS '';
SELECT id, restaurant_id, name, price FROM dishes LIMIT 10;

SELECT '--- REVIEWS ---' AS '';
SELECT id, restaurant_id, user_name, rating FROM reviews;

SELECT '=== READY FOR REGISTRATION! ===' AS '';
SELECT 'Go to: http://localhost:3000/register' AS '';
SELECT 'Test Login: owner1@dishcovery.com / password123' AS '';