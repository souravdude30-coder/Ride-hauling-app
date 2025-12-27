#!/usr/bin/env python3
"""
Additional Authentication Edge Case Tests
"""

import asyncio
import aiohttp
import json

BASE_URL = "https://uber-clone-138.preview.emergentagent.com/api"

async def test_edge_cases():
    """Test additional edge cases"""
    
    async with aiohttp.ClientSession() as session:
        print("🔍 Running Additional Authentication Edge Case Tests")
        print("=" * 60)
        
        # Test 1: Missing Authorization header
        print("Test 1: Missing Authorization Header")
        async with session.get(f"{BASE_URL}/auth/me") as response:
            if response.status == 401:
                print("✅ PASS - Correctly rejected missing auth header")
            else:
                print(f"❌ FAIL - Expected 401, got {response.status}")
        
        # Test 2: Malformed Authorization header
        print("\nTest 2: Malformed Authorization Header")
        headers = {"Authorization": "InvalidFormat token123"}
        async with session.get(f"{BASE_URL}/auth/me", headers=headers) as response:
            if response.status == 401:
                print("✅ PASS - Correctly rejected malformed auth header")
            else:
                print(f"❌ FAIL - Expected 401, got {response.status}")
        
        # Test 3: Empty password registration
        print("\nTest 3: Empty Password Registration")
        data = {
            "email": "empty@test.com",
            "password": "",
            "name": "Empty Password User",
            "role": "passenger"
        }
        async with session.post(f"{BASE_URL}/auth/register", json=data) as response:
            if response.status == 400 or response.status == 422:
                print("✅ PASS - Correctly rejected empty password")
            else:
                print(f"❌ FAIL - Expected 400/422, got {response.status}")
        
        # Test 4: Invalid email format
        print("\nTest 4: Invalid Email Format")
        data = {
            "email": "invalid-email",
            "password": "Test@123",
            "name": "Invalid Email User",
            "role": "passenger"
        }
        async with session.post(f"{BASE_URL}/auth/register", json=data) as response:
            if response.status == 422:
                print("✅ PASS - Correctly rejected invalid email format")
            else:
                print(f"❌ FAIL - Expected 422, got {response.status}")
        
        # Test 5: Duplicate email registration
        print("\nTest 5: Duplicate Email Registration")
        data = {
            "email": "admin@metrohail.com",  # This user already exists
            "password": "Test@123",
            "name": "Duplicate User",
            "role": "passenger"
        }
        async with session.post(f"{BASE_URL}/auth/register", json=data) as response:
            if response.status == 400:
                print("✅ PASS - Correctly rejected duplicate email")
            else:
                print(f"❌ FAIL - Expected 400, got {response.status}")
        
        # Test 6: Login with non-existent user
        print("\nTest 6: Login with Non-existent User")
        data = {
            "email": "nonexistent@test.com",
            "password": "Test@123"
        }
        async with session.post(f"{BASE_URL}/auth/login", json=data) as response:
            if response.status == 401:
                print("✅ PASS - Correctly rejected non-existent user")
            else:
                print(f"❌ FAIL - Expected 401, got {response.status}")
        
        # Test 7: Very long password (should work now with our fix)
        print("\nTest 7: Very Long Password")
        long_password = "A" * 100 + "@123"  # 104 characters
        data = {
            "email": "longpass@test.com",
            "password": long_password,
            "name": "Long Password User",
            "role": "passenger"
        }
        async with session.post(f"{BASE_URL}/auth/register", json=data) as response:
            if response.status == 200:
                print("✅ PASS - Successfully handled long password")
                
                # Try to login with the long password
                login_data = {
                    "email": "longpass@test.com",
                    "password": long_password
                }
                async with session.post(f"{BASE_URL}/auth/login", json=login_data) as login_response:
                    if login_response.status == 200:
                        print("✅ PASS - Successfully logged in with long password")
                    else:
                        print(f"❌ FAIL - Login failed with long password: {login_response.status}")
            else:
                print(f"❌ FAIL - Long password registration failed: {response.status}")
        
        print("\n" + "=" * 60)
        print("✅ Additional edge case tests completed")

if __name__ == "__main__":
    asyncio.run(test_edge_cases())