USE dishcovery;

-- Insert sample restaurants
INSERT INTO restaurants (name, description, cuisine, location, price_range, rating) VALUES
('Mama Mia Italian', 'Authentic Italian cuisine with wood-fired pizzas', 'Italian', 'Downtown', 3, 4.5),
('Spice Kingdom', 'Traditional Indian dishes with modern twist', 'Indian', 'Midtown', 2, 4.2),
('Tokyo Sushi', 'Fresh sushi and Japanese specialties', 'Japanese', 'Waterfront', 4, 4.7),
('El Mariachi', 'Vibrant Mexican street food', 'Mexican', 'East Side', 1, 4.0),
('Le French Cafe', 'French pastries and coffee', 'French', 'West End', 3, 4.3);

-- Insert sample dishes
INSERT INTO dishes (restaurant_id, name, description, price, category, is_vegetarian, is_spicy) VALUES
(1, 'Margherita Pizza', 'Classic tomato, mozzarella, basil', 14.99, 'Main Course', true, false),
(1, 'Spaghetti Carbonara', 'Pasta with eggs, cheese, pancetta', 16.50, 'Main Course', false, false),
(2, 'Butter Chicken', 'Creamy tomato curry with chicken', 18.99, 'Main Course', false, true),
(2, 'Vegetable Biryani', 'Spiced rice with mixed vegetables', 15.50, 'Main Course', true, true),
(3, 'Salmon Sushi Roll', 'Fresh salmon with avocado', 12.99, 'Sushi', false, false),
(4, 'Beef Tacos', 'Three soft tacos with seasoned beef', 11.99, 'Main Course', false, true),
(5, 'Croissant', 'Freshly baked butter croissant', 3.50, 'Breakfast', true, false);

-- Insert sample reviews
INSERT INTO reviews (restaurant_id, user_name, comment, rating) VALUES
(1, 'Alex Johnson', 'Best pizza in town!', 5),
(1, 'Sam Wilson', 'Carbonara was a bit salty', 3),
(2, 'Priya Sharma', 'Authentic flavors, loved it!', 5),
(3, 'Ken Tanaka', 'Fresh fish, excellent quality', 4),
(4, 'Maria Garcia', 'Great value for money', 4);