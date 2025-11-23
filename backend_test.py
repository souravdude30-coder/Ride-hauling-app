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
        self.passenger_token = None
        self.corporate_token = None
        self.driver_token = None
        self.test_data = {
            "order_id": None,
            "pass_id": None,
            "booking_id": None,
            "otp": None,
            "qr_data": None,
            "daily_plan_id": None,
            "monthly_basic_plan_id": None
        }
        
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
    
    async def login_user(self, email: str, password: str) -> Optional[str]:
        """Helper method to login and get token"""
        test_data = {"email": email, "password": password}
        
        success, response, status = await self.make_request(
            "POST", "/auth/login", test_data, expect_status=200
        )
        
        if success and "access_token" in response:
            return response["access_token"]
        return None
    
    async def test_subscription_plans(self):
        """Test 1: Get Subscription Plans"""
        success, response, status = await self.make_request(
            "GET", "/passes/plans", expect_status=200
        )
        
        if success:
            if "plans" in response and isinstance(response["plans"], list):
                plans = response["plans"]
                if len(plans) >= 6:
                    # Check for required plan fields
                    required_fields = ["id", "name", "type", "validity_days", "number_of_passes", "price"]
                    plan_names = [plan.get("name", "") for plan in plans]
                    
                    # Store plan IDs for later tests
                    for plan in plans:
                        if "Daily" in plan.get("name", ""):
                            self.test_data["daily_plan_id"] = plan.get("id")
                        elif "Monthly Basic" in plan.get("name", ""):
                            self.test_data["monthly_basic_plan_id"] = plan.get("id")
                    
                    missing_fields = []
                    for plan in plans[:1]:  # Check first plan
                        missing_fields.extend([field for field in required_fields if field not in plan])
                    
                    if missing_fields:
                        self.log_test("Subscription Plans", False, 
                                    f"Missing fields in plan: {missing_fields}", response)
                    else:
                        self.log_test("Subscription Plans", True, 
                                    f"Found {len(plans)} plans with required fields: {', '.join(plan_names[:3])}...")
                else:
                    self.log_test("Subscription Plans", False, 
                                f"Expected at least 6 plans, got {len(plans)}", response)
            else:
                self.log_test("Subscription Plans", False, 
                            "Missing 'plans' array in response", response)
        else:
            self.log_test("Subscription Plans", False, 
                        f"Failed to get plans with status {status}", response)
    
    async def test_payment_order_creation(self):
        """Test 2: Payment Order Creation (Passenger User)"""
        # Login as passenger
        self.passenger_token = await self.login_user("passenger@gmail.com", "Pass@123")
        
        if not self.passenger_token:
            self.log_test("Payment Order Creation", False, "Failed to login as passenger")
            return
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        test_data = {
            "amount": 100.0,
            "description": "Test payment for daily pass"
        }
        
        success, response, status = await self.make_request(
            "POST", "/payments/create-order", test_data, headers=headers, expect_status=200
        )
        
        if success:
            if "success" in response and response["success"] and "order" in response:
                order = response["order"]
                required_fields = ["order_id", "amount", "currency", "key_id", "transaction_id"]
                missing_fields = [field for field in required_fields if field not in order]
                
                if missing_fields:
                    self.log_test("Payment Order Creation", False, 
                                f"Missing order fields: {missing_fields}", response)
                else:
                    # Store order_id for next test
                    self.test_data["order_id"] = order.get("order_id")
                    
                    # Verify amount is in paise (10000 for ₹100)
                    expected_amount = 10000
                    actual_amount = order.get("amount")
                    
                    if actual_amount == expected_amount and order.get("currency") == "INR":
                        self.log_test("Payment Order Creation", True, 
                                    f"Order created successfully: {order.get('order_id')}, Amount: {actual_amount} paise")
                    else:
                        self.log_test("Payment Order Creation", False, 
                                    f"Amount/currency mismatch: expected {expected_amount} INR, got {actual_amount} {order.get('currency')}")
            else:
                self.log_test("Payment Order Creation", False, 
                            "Missing success=true or order in response", response)
        else:
            self.log_test("Payment Order Creation", False, 
                        f"Order creation failed with status {status}", response)
    
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