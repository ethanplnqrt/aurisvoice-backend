#!/bin/bash

# AurisVoice - Test Webhook Script
# Quick script to test webhook endpoints locally

echo "🧪 AurisVoice - Test Webhook Script"
echo "===================================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:10000}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "1️⃣  Testing server status..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/status)
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server not responding (HTTP $response)${NC}"
    echo "   Start server with: node server-stripe.js"
    exit 1
fi
echo ""

# Test 2: Check initial credits
echo "2️⃣  Checking initial credits..."
credits_response=$(curl -s $API_URL/api/credits)
initial_credits=$(echo $credits_response | grep -o '"credits":[0-9]*' | grep -o '[0-9]*')
echo -e "${YELLOW}   Current balance: $initial_credits credits${NC}"
echo ""

# Test 3: Simulate Starter purchase (5€ / 15 credits)
echo "3️⃣  Simulating Starter purchase (5€ / 15 credits)..."
curl -s -X POST $API_URL/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true,"amount_total":500,"credits":"15","plan":"starter"}' \
  | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

# Test 4: Check updated credits
echo "4️⃣  Checking updated credits..."
sleep 1
credits_response=$(curl -s $API_URL/api/credits)
new_credits=$(echo $credits_response | grep -o '"credits":[0-9]*' | grep -o '[0-9]*')
added_credits=$((new_credits - initial_credits))
echo -e "${YELLOW}   New balance: $new_credits credits (+$added_credits)${NC}"
echo ""

# Test 5: Check webhook log
echo "5️⃣  Checking webhook log..."
curl -s $API_URL/api/webhook-log | python3 -m json.tool 2>/dev/null || echo "Log retrieved"
echo ""

# Summary
echo "===================================="
echo "🎉 Test Summary"
echo "===================================="
echo -e "Initial credits:  ${YELLOW}$initial_credits${NC}"
echo -e "Credits added:    ${GREEN}+$added_credits${NC}"
echo -e "Final balance:    ${GREEN}$new_credits${NC}"
echo ""

if [ "$added_credits" -eq 15 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Test failed: Expected +15 credits, got +$added_credits${NC}"
    exit 1
fi

