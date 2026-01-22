/**
 * VALIDATION UTILITIES
 * Common validation functions for input data
 */

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
};

// Password validation
const isValidPassword = (password) => {
  // At least 6 characters, at least one number or special char
  return password && password.length >= 6 && password.length <= 255;
};

// Name validation
const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Phone validation (optional, but if provided must be valid)
const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

// URL validation
const isValidUrl = (url) => {
  if (!url) return true; // Optional
  try {
    new URL(url);
    return url.length <= 255;
  } catch {
    return false;
  }
};

// Restaurant name validation
const isValidRestaurantName = (name) => {
  return name && name.trim().length >= 3 && name.trim().length <= 100;
};

// Cuisine validation
const isValidCuisine = (cuisine) => {
  return cuisine && cuisine.trim().length >= 2 && cuisine.trim().length <= 50;
};

// Location validation
const isValidLocation = (location) => {
  return location && location.trim().length >= 2 && location.trim().length <= 100;
};

// Price range validation (1-5)
const isValidPriceRange = (priceRange) => {
  if (!priceRange) return true; // Optional, defaults to 3
  const price = parseInt(priceRange);
  return !isNaN(price) && price >= 1 && price <= 5;
};

// Dish name validation
const isValidDishName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Price validation (must be positive number)
const isValidPrice = (price) => {
  const priceNum = parseFloat(price);
  return !isNaN(priceNum) && priceNum > 0 && priceNum <= 10000;
};

// Rating validation (1-5)
const isValidRating = (rating) => {
  const ratingNum = parseInt(rating);
  return !isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5;
};

// Role validation
const isValidRole = (role) => {
  return ['customer', 'owner', 'admin'].includes(role);
};

// Status validation (for restaurants)
const isValidStatus = (status) => {
  return ['pending', 'approved', 'rejected'].includes(status);
};

// JSON field validation
const isValidJSON = (jsonString) => {
  if (!jsonString) return true;
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

// Description validation (optional)
const isValidDescription = (description) => {
  if (!description) return true;
  return description.length <= 2000;
};

// Bio validation (optional)
const isValidBio = (bio) => {
  if (!bio) return true;
  return bio.length <= 500;
};

// Pagination validation
const isValidPage = (page) => {
  const pageNum = parseInt(page);
  return !isNaN(pageNum) && pageNum >= 1;
};

const isValidLimit = (limit) => {
  const limitNum = parseInt(limit);
  return !isNaN(limitNum) && limitNum >= 1 && limitNum <= 100;
};

// Generic string length validation
const isValidStringLength = (str, min = 1, max = 255) => {
  if (!str) return min === 0;
  return str.length >= min && str.length <= max;
};

/**
 * Validation result object
 */
const createValidationResult = (isValid, error = null) => ({
  isValid,
  error
});

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidPhone,
  isValidUrl,
  isValidRestaurantName,
  isValidCuisine,
  isValidLocation,
  isValidPriceRange,
  isValidDishName,
  isValidPrice,
  isValidRating,
  isValidRole,
  isValidStatus,
  isValidJSON,
  isValidDescription,
  isValidBio,
  isValidPage,
  isValidLimit,
  isValidStringLength,
  createValidationResult
};
