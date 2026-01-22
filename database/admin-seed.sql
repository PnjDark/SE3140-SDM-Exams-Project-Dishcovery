-- Admin User Setup for Testing
-- This script creates a test admin user and some sample data for the admin dashboard

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, is_verified, location, bio, avatar_url)
VALUES (
  'admin@dishcovery.test',
  '$2a$10$NQqH5C8jHKJvZHIWfKtXv.JhZIVQ5R8Y9K2q9Q8Z8ZQ8Z8Z8Z8Z8Z',
  'Admin User',
  'admin',
  true,
  'Dishcovery HQ',
  'Platform Administrator',
  NULL
) ON DUPLICATE KEY UPDATE id=id;

-- Create sample customer users
INSERT INTO users (email, password_hash, name, role, is_verified, created_at)
VALUES 
  ('customer1@test.com', '$2a$10$...', 'John Doe', 'customer', true, NOW()),
  ('customer2@test.com', '$2a$10$...', 'Jane Smith', 'customer', true, NOW()),
  ('customer3@test.com', '$2a$10$...', 'Bob Johnson', 'customer', true, NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Create sample restaurant owner
INSERT INTO users (email, password_hash, name, role, is_verified, created_at)
VALUES ('owner@test.com', '$2a$10$...', 'Restaurant Owner', 'owner', true, NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Create sample restaurants with various statuses
INSERT INTO restaurants (name, cuisine, location, description, price_range, owner_id, status, created_at)
VALUES 
  ('Pending Restaurant', 'Italian', 'Downtown', 'Awaiting approval', 3, 2, 'pending', NOW()),
  ('Approved Restaurant', 'Asian Fusion', 'Midtown', 'Already approved', 4, 2, 'approved', NOW()),
  ('Rejected Restaurant', 'Mexican', 'Uptown', 'Was rejected', 2, 2, 'rejected', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Note: To generate correct bcrypt hashes, use:
-- echo 'admin123' | npx bcrypt-cli
-- Replace $2a$10$... with actual hashes when running this script
