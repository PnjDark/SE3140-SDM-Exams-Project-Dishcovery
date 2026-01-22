#!/bin/bash

# filepath: server/scripts/setup.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Navigate to project root
cd "$(dirname "$0")/../.."

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  DishDiscovery - Project Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js found"
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} npm is not installed"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} npm found"
npm --version
echo ""

# Install root dependencies
echo -e "${YELLOW}[INFO]${NC} Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install root dependencies"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Root dependencies installed"
echo ""

# Install server dependencies
echo -e "${YELLOW}[INFO]${NC} Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install server dependencies"
    cd ..
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Server dependencies installed"
cd ..
echo ""

# Install client dependencies
echo -e "${YELLOW}[INFO]${NC} Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install client dependencies"
    cd ..
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Client dependencies installed"
cd ..
echo ""

# Create .env file in server if not exists
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}[INFO]${NC} Creating server/.env file..."
    cat > server/.env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dishcovery
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
PORT=5000
EOF
    echo -e "${GREEN}[OK]${NC} server/.env created with defaults"
fi
echo ""

# Setup database
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Database Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "${YELLOW}[IMPORTANT]${NC} Make sure MySQL is running!"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${YELLOW}[INFO]${NC} Running database setup..."
cd server
npm run db:setup
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Database setup failed!"
    echo "Please check:"
    echo "  1. MySQL is running"
    echo "  2. Database credentials in server/.env are correct"
    echo "  3. Database user has CREATE DATABASE privileges"
    cd ..
    exit 1
fi
cd ..
echo ""

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "${YELLOW}[INFO]${NC} Sample Accounts Created:"
echo "  Admin:       admin@dishcovery.com / password123"
echo "  Owner 1:     owner1@dishcovery.com / password123"
echo "  Owner 2:     owner2@dishcovery.com / password123"
echo "  Customer 1:  customer1@dishcovery.com / password123"
echo "  Customer 2:  customer2@dishcovery.com / password123"
echo ""
echo -e "${YELLOW}[INFO]${NC} Next steps:"
echo "  1. Terminal 1 - Start server:  cd server && npm run dev"
echo "  2. Terminal 2 - Start client:  cd client && npm start"
echo ""