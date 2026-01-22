#!/usr/bin/env node

/**
 * Database Setup Wrapper
 * This file loads the database setup module with proper NODE_PATH configuration
 */

const path = require('path');
const fs = require('fs');

// Get absolute paths
const serverDir = __dirname;
const serverNodeModules = path.join(serverDir, 'node_modules');
const databaseDir = path.join(serverDir, '..', 'database');
const setupFile = path.join(databaseDir, 'setup.js');

// Verify paths exist
if (!fs.existsSync(serverNodeModules)) {
  console.error('❌ Error: server/node_modules not found');
  process.exit(1);
}

if (!fs.existsSync(setupFile)) {
  console.error('❌ Error: database/setup.js not found');
  process.exit(1);
}

// Set NODE_PATH environment variable for module resolution
process.env.NODE_PATH = serverNodeModules;

// Load the database setup module
require(setupFile);
