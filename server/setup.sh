#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Interview Scheduler Backend...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n${GREEN}Installing dependencies...${NC}"
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "\n${GREEN}Creating .env file...${NC}"
    echo "PORT=3000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password" > .env
    echo -e "${YELLOW}Please update the .env file with your configuration.${NC}"
fi

echo -e "\n${GREEN}Setup completed!${NC}"
echo -e "\nTo start the server:"
echo -e "1. Development mode: ${YELLOW}npm run dev${NC}"
echo -e "2. Production mode: ${YELLOW}npm start${NC}"
echo -e "\nThe server will run on http://localhost:3000"
echo -e "The frontend files should be served from the 'interview-scheduler' directory"
