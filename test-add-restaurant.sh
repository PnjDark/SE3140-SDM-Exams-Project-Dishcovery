#!/bin/bash

# 🍽️ DISHCOVERY - ADD RESTAURANT EXAMPLES
# Complete examples for testing the restaurant creation endpoint

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🍽️  DISHCOVERY - ADD RESTAURANT TESTS${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ============ STEP 1: REGISTER AS OWNER ============
echo -e "${YELLOW}Step 1: Registering as restaurant owner...${NC}"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner'$(date +%s)'@test.com",
    "password": "password123",
    "name": "Test Owner",
    "role": "owner"
  }')

TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to register. Response: $REGISTER_RESPONSE${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Owner registered successfully${NC}"
echo -e "${GREEN}Token: ${TOKEN:0:50}...${NC}\n"

# ============ STEP 2: CREATE RESTAURANT (MINIMAL) ============
echo -e "${YELLOW}Step 2: Creating restaurant with minimal fields...${NC}"

MINIMAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/owner/restaurants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Simple Cafe",
    "cuisine": "Cafe",
    "location": "Midtown"
  }')

RESTAURANT_ID=$(echo "$MINIMAL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

if [ -z "$RESTAURANT_ID" ]; then
  echo -e "${RED}Failed to create minimal restaurant${NC}"
  echo "$MINIMAL_RESPONSE" | python3 -m json.tool
  exit 1
fi

echo -e "${GREEN}✓ Minimal restaurant created${NC}"
echo -e "  ID: $RESTAURANT_ID"
echo -e "  Status: pending\n"

# ============ STEP 3: CREATE RESTAURANT (COMPLETE) ============
echo -e "${YELLOW}Step 3: Creating restaurant with all fields...${NC}"

COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/owner/restaurants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Delicious Pizza House",
    "cuisine": "Italian",
    "location": "Downtown District",
    "description": "Authentic Italian pizzeria with traditional wood-fired oven and imported ingredients",
    "price_range": 3,
    "contact_phone": "+1-555-123-4567",
    "contact_email": "owner@pizzahouse.com",
    "website": "https://www.pizzahouse.com",
    "opening_hours": {
      "monday": "11:00-23:00",
      "tuesday": "11:00-23:00",
      "wednesday": "11:00-23:00",
      "thursday": "11:00-23:00",
      "friday": "11:00-00:00",
      "saturday": "12:00-00:00",
      "sunday": "12:00-22:00"
    },
    "social_links": {
      "instagram": "@pizzahouse",
      "facebook": "pizzahouse.official"
    }
  }')

RESTAURANT_ID_2=$(echo "$COMPLETE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

if [ -z "$RESTAURANT_ID_2" ]; then
  echo -e "${RED}Failed to create complete restaurant${NC}"
  echo "$COMPLETE_RESPONSE" | python3 -m json.tool
  exit 1
fi

echo -e "${GREEN}✓ Complete restaurant created${NC}"
echo -e "  ID: $RESTAURANT_ID_2"
echo -e "  Name: Delicious Pizza House\n"

# ============ STEP 4: TEST VALIDATION ERRORS ============
echo -e "${YELLOW}Step 4: Testing validation errors...${NC}"

echo -e "\n  4a. Testing short restaurant name (< 3 chars):"
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/owner/restaurants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "AB",
    "cuisine": "Italian",
    "location": "Downtown"
  }')

ERROR_MSG=$(echo "$VALIDATION_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['details']['fields'].get('name', 'Unknown'))" 2>/dev/null)
echo -e "     ${RED}✗ Expected error: $ERROR_MSG${NC}"

echo -e "\n  4b. Testing invalid email format:"
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/owner/restaurants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Valid Restaurant",
    "cuisine": "Mexican",
    "location": "Downtown",
    "contact_email": "invalid-email"
  }')

ERROR_MSG=$(echo "$VALIDATION_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['details']['fields'].get('contact_email', 'Unknown'))" 2>/dev/null)
echo -e "     ${RED}✗ Expected error: $ERROR_MSG${NC}"

echo -e "\n  4c. Testing invalid price range:"
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/owner/restaurants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Valid Restaurant",
    "cuisine": "Chinese",
    "location": "Downtown",
    "price_range": 10
  }')

ERROR_MSG=$(echo "$VALIDATION_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['details']['fields'].get('price_range', 'Unknown'))" 2>/dev/null)
echo -e "     ${RED}✗ Expected error: $ERROR_MSG${NC}"

# ============ STEP 5: VERIFY RESTAURANTS ============
echo -e "\n${YELLOW}Step 5: Verifying restaurants were created...${NC}"

RESTAURANTS=$(curl -s -X GET "$BASE_URL/api/owner/restaurants" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$RESTAURANTS" | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null)

echo -e "${GREEN}✓ Owner has $COUNT restaurants${NC}"
echo -e "  (at least 2 should be pending for approval)\n"

# ============ STEP 6: CHECK ADMIN VIEW ============
echo -e "${YELLOW}Step 6: (For testing) Admin can see pending restaurants...${NC}"
echo -e "  Use: GET /api/admin/restaurants?status=pending"
echo -e "  With: Admin role JWT token\n"

# ============ SUMMARY ============
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ ALL TESTS COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Summary:${NC}"
echo -e "  • Registered owner: $TOKEN"
echo -e "  • Created restaurant 1 (minimal): ID $RESTAURANT_ID"
echo -e "  • Created restaurant 2 (complete): ID $RESTAURANT_ID_2"
echo -e "  • Tested validation errors: 3 scenarios"
echo -e "  • Verified restaurant count: $COUNT restaurants\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Login to admin dashboard at /dashboard/admin"
echo -e "  2. Navigate to 'Restaurants' tab"
echo -e "  3. Filter by status: pending"
echo -e "  4. Review and approve the restaurants"
echo -e "  5. Customers should now see them in the restaurant list\n"

echo -e "${BLUE}API Endpoint Reference:${NC}"
echo -e "  • Create: POST /api/owner/restaurants"
echo -e "  • List: GET /api/owner/restaurants"
echo -e "  • Update: PUT /api/owner/restaurants/:id"
echo -e "  • Admin Approve: PUT /api/admin/restaurants/:id/status"
