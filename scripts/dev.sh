#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to kill processes on port 8081
kill_metro() {
    echo "${YELLOW}Checking for existing Metro processes...${NC}"
    lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null
    sleep 1
}

# Function to start Metro
start_metro() {
    echo "${GREEN}Starting Metro bundler...${NC}"
    ENABLE_FAST_REFRESH=true npx react-native start --reset-cache
}

# Main execution
echo "${YELLOW}Setting up development environment...${NC}"

# Kill any existing Metro processes
kill_metro

# Clear watchman watches
echo "${YELLOW}Clearing Watchman watches...${NC}"
watchman watch-del-all 2>/dev/null

# Clear Metro cache
echo "${YELLOW}Clearing Metro cache...${NC}"
rm -rf $TMPDIR/metro-* 2>/dev/null

# Start Metro bundler
start_metro 