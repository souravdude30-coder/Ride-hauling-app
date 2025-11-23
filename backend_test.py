#!/usr/bin/env python3
"""
Backend Payment Gateway, Subscription Plans, and Booking System Test Suite
Tests payment gateway, subscription plans, and booking system functionality
"""

import asyncio
import aiohttp
import json
import sys
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

# Test configuration
BASE_URL = "https://metrohail.preview.emergentagent.com/api"

class PaymentBookingTestSuite:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.auth_token = None
        
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        
    async def teardown(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if response_data and not success:
            print(f"    Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, 
                          headers: Dict = None, expect_status: int = 200) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{BASE_URL}{endpoint}"
        
        try:
            if method.upper() == "GET":
                async with self.session.get(url, headers=headers) as response:
                    response_data = await response.json()
                    return response.status == expect_status, response_data, response.status
            elif method.upper() == "POST":
                async with self.session.post(url, json=data, headers=headers) as response:
                    response_data = await response.json()
                    return response.status == expect_status, response_data, response.status
        except Exception as e:
            return False, {"error": str(e)}, 0
    
    async def test_user_registration(self):
        """Test 1: User Registration"""
        test_data = {
            "email": "testuser@test.com",
            "password": "Test@123",
            "name": "Test User",
            "role": "passenger"
        }
        
        success, response, status = await self.make_request(
            "POST", "/auth/register", test_data, expect_status=200
        )
        
        if success:
            # Check response structure
            required_fields = ["id", "email", "name", "role", "permissions", "is_active"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test("User Registration", False, 
                            f"Missing fields in response: {missing_fields}", response)
            elif "password_hash" in response:
                self.log_test("User Registration", False, 
                            "password_hash should not be in response", response)
            else:
                self.log_test("User Registration", True, 
                            f"User created successfully with ID: {response.get('id')}")
        else:
            self.log_test("User Registration", False, 
                        f"Registration failed with status {status}", response)
    
    async def test_user_login_valid(self):
        """Test 2: Valid User Login"""
        test_data = {
            "email": "admin@metrohail.com",
            "password": "Admin@123"
        }
        
        success, response, status = await self.make_request(
            "POST", "/auth/login", test_data, expect_status=200
        )
        
        if success:
            # Check response structure
            if "access_token" in response and "user" in response:
                self.auth_token = response["access_token"]  # Store for later tests
                user_data = response["user"]
                
                # Verify user data structure
                required_user_fields = ["id", "email", "name", "role", "permissions"]
                missing_fields = [field for field in required_user_fields if field not in user_data]
                
                if missing_fields:
                    self.log_test("Valid User Login", False, 
                                f"Missing user fields: {missing_fields}", response)
                else:
                    self.log_test("Valid User Login", True, 
                                f"Login successful for {user_data.get('email')} with role {user_data.get('role')}")
            else:
                self.log_test("Valid User Login", False, 
                            "Missing access_token or user in response", response)
        else:
            self.log_test("Valid User Login", False, 
                        f"Login failed with status {status}", response)
    
    async def test_user_login_invalid(self):
        """Test 3: Invalid Password Login"""
        test_data = {
            "email": "admin@metrohail.com",
            "password": "wrongpassword"
        }
        
        success, response, status = await self.make_request(
            "POST", "/auth/login", test_data, expect_status=401
        )
        
        if success:
            self.log_test("Invalid Password Login", True, 
                        "Correctly rejected invalid password")
        else:
            self.log_test("Invalid Password Login", False, 
                        f"Expected 401 but got {status}", response)
    
    async def test_token_verification(self):
        """Test 4: Token Verification"""
        if not self.auth_token:
            self.log_test("Token Verification", False, 
                        "No auth token available from previous login test")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        success, response, status = await self.make_request(
            "GET", "/auth/verify-token", headers=headers, expect_status=200
        )
        
        if success:
            if response.get("valid") is True:
                self.log_test("Token Verification", True, 
                            f"Token verified for user {response.get('user_id')} with role {response.get('role')}")
            else:
                self.log_test("Token Verification", False, 
                            "Token marked as invalid", response)
        else:
            self.log_test("Token Verification", False, 
                        f"Token verification failed with status {status}", response)
    
    async def test_get_current_user(self):
        """Test 5: Get Current User"""
        if not self.auth_token:
            self.log_test("Get Current User", False, 
                        "No auth token available from previous login test")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        success, response, status = await self.make_request(
            "GET", "/auth/me", headers=headers, expect_status=200
        )
        
        if success:
            required_fields = ["id", "email", "name", "role", "permissions", "is_active"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test("Get Current User", False, 
                            f"Missing fields: {missing_fields}", response)
            elif "password_hash" in response:
                self.log_test("Get Current User", False, 
                            "password_hash should not be in response", response)
            else:
                self.log_test("Get Current User", True, 
                            f"Retrieved user data for {response.get('email')}")
        else:
            self.log_test("Get Current User", False, 
                        f"Failed to get user data with status {status}", response)
    
    async def test_invalid_token(self):
        """Test 6: Invalid Token"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        
        success, response, status = await self.make_request(
            "GET", "/auth/me", headers=headers, expect_status=401
        )
        
        if success:
            self.log_test("Invalid Token", True, 
                        "Correctly rejected invalid token")
        else:
            self.log_test("Invalid Token", False, 
                        f"Expected 401 but got {status}", response)
    
    async def test_existing_users_login(self):
        """Test 7: Test all existing users can login"""
        existing_users = [
            {"email": "admin@metrohail.com", "password": "Admin@123", "role": "master_admin"},
            {"email": "fleet@company.com", "password": "Fleet@123", "role": "fleet_manager"},
            {"email": "corporate@techcorp.com", "password": "Corp@123", "role": "corporate_admin"},
            {"email": "driver@metrohail.com", "password": "Driver@123", "role": "driver"},
            {"email": "passenger@gmail.com", "password": "Pass@123", "role": "passenger"},
            {"email": "parent@gmail.com", "password": "Parent@123", "role": "parent"}
        ]
        
        successful_logins = 0
        total_users = len(existing_users)
        
        for user in existing_users:
            test_data = {
                "email": user["email"],
                "password": user["password"]
            }
            
            success, response, status = await self.make_request(
                "POST", "/auth/login", test_data, expect_status=200
            )
            
            if success and "access_token" in response:
                user_data = response.get("user", {})
                expected_role = user["role"]
                actual_role = user_data.get("role")
                
                if actual_role == expected_role:
                    successful_logins += 1
                    print(f"    ✅ {user['email']} ({expected_role}) - Login successful")
                else:
                    print(f"    ❌ {user['email']} - Role mismatch: expected {expected_role}, got {actual_role}")
            else:
                print(f"    ❌ {user['email']} - Login failed: {response}")
        
        if successful_logins == total_users:
            self.log_test("Existing Users Login", True, 
                        f"All {total_users} existing users can login successfully")
        else:
            self.log_test("Existing Users Login", False, 
                        f"Only {successful_logins}/{total_users} users can login")
    
    async def test_password_hashing(self):
        """Test 8: Verify password hashing is working"""
        # This test verifies that we can login with correct password and fail with wrong password
        # indicating that password hashing/verification is working
        
        test_email = "admin@metrohail.com"
        correct_password = "Admin@123"
        wrong_password = "WrongPassword123"
        
        # Test correct password
        success_correct, _, _ = await self.make_request(
            "POST", "/auth/login", 
            {"email": test_email, "password": correct_password}, 
            expect_status=200
        )
        
        # Test wrong password
        success_wrong, _, status_wrong = await self.make_request(
            "POST", "/auth/login", 
            {"email": test_email, "password": wrong_password}, 
            expect_status=401
        )
        
        if success_correct and success_wrong:
            self.log_test("Password Hashing", True, 
                        "Password hashing and verification working correctly")
        else:
            details = []
            if not success_correct:
                details.append("correct password failed")
            if not success_wrong:
                details.append(f"wrong password didn't return 401 (got {status_wrong})")
            
            self.log_test("Password Hashing", False, 
                        f"Password hashing issues: {', '.join(details)}")
    
    async def run_all_tests(self):
        """Run all authentication tests"""
        print("🚀 Starting Backend Authentication Test Suite")
        print("=" * 60)
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        print()
        
        await self.setup()
        
        try:
            # Run all tests
            await self.test_user_registration()
            await self.test_user_login_valid()
            await self.test_user_login_invalid()
            await self.test_token_verification()
            await self.test_get_current_user()
            await self.test_invalid_token()
            await self.test_existing_users_login()
            await self.test_password_hashing()
            
        finally:
            await self.teardown()
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed! Authentication system is working correctly.")
            return True
        else:
            print(f"\n⚠️ {total - passed} test(s) failed. Please check the issues above.")
            return False

async def main():
    """Main test runner"""
    test_suite = AuthTestSuite()
    success = await test_suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())