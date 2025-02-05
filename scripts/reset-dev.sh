#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${YELLOW}Starting development environment reset...${NC}"

# Kill existing processes
echo "${YELLOW}Killing existing processes...${NC}"
killall -9 node 2>/dev/null
watchman watch-del-all 2>/dev/null

# Clear caches
echo "${YELLOW}Clearing caches...${NC}"
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null

# Clean iOS build
if [ -d "ios" ]; then
  echo "${YELLOW}Cleaning iOS build...${NC}"
  cd ios
  rm -rf build
  rm -rf Pods
  pod install
  cd ..
fi

# Clean Android build
if [ -d "android" ]; then
  echo "${YELLOW}Cleaning Android build...${NC}"
  cd android
  ./gradlew clean
  cd ..
fi

# Clear npm cache and reinstall
echo "${YELLOW}Reinstalling dependencies...${NC}"
rm -rf node_modules
npm cache clean --force
npm install

echo "${GREEN}Reset complete! Start your app with:${NC}"
echo "${YELLOW}npm start${NC}" 