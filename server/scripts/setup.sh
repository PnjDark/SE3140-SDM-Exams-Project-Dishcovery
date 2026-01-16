#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 DishDiscovery Database Setup${NC}"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if MySQL is running
if ! mysqladmin ping -h localhost --silent; then
    echo -e "${RED}❌ MySQL is not running. Start MySQL first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and MySQL are ready${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the database setup
echo "🗃️ Setting up database..."
npm run db:setup

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo "📋 Sample Accounts:"
    echo "   Admin:     admin@dishcovery.com / password123"
    echo "   Owner 1:   owner1@dishcovery.com / password123"
    echo "   Owner 2:   owner2@dishcovery.com / password123"
    echo "   Customer 1: customer1@dishcovery.com / password123"
    echo "   Customer 2: customer2@dishcovery.com / password123"
    echo ""
    echo "🚀 Start the server: npm run dev"
else
    echo -e "${RED}💥 Setup failed${NC}"
    exit 1
fi