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
    
    async def test_payment_verification_with_pass_purchase(self):
        """Test 3: Payment Verification with Pass Purchase (Passenger User)"""
        if not self.passenger_token or not self.test_data["order_id"] or not self.test_data["daily_plan_id"]:
            self.log_test("Payment Verification with Pass Purchase", False, 
                        "Missing prerequisites: token, order_id, or plan_id")
            return
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        test_data = {
            "razorpay_order_id": self.test_data["order_id"],
            "razorpay_payment_id": "pay_test_12345",
            "razorpay_signature": "test_signature",
            "plan_id": self.test_data["daily_plan_id"]
        }
        
        success, response, status = await self.make_request(
            "POST", "/payments/verify-payment", test_data, headers=headers, expect_status=200
        )
        
        if success:
            if response.get("success") and "pass" in response:
                pass_data = response["pass"]
                required_fields = ["id", "plan_name", "total_passes", "remaining_passes", "valid_from", "valid_until"]
                missing_fields = [field for field in required_fields if field not in pass_data]
                
                if missing_fields:
                    self.log_test("Payment Verification with Pass Purchase", False, 
                                f"Missing pass fields: {missing_fields}", response)
                else:
                    # Store pass_id for later tests
                    self.test_data["pass_id"] = pass_data.get("id")
                    self.log_test("Payment Verification with Pass Purchase", True, 
                                f"Payment verified and pass created: {pass_data.get('plan_name')}, Passes: {pass_data.get('total_passes')}")
            else:
                self.log_test("Payment Verification with Pass Purchase", False, 
                            "Missing success=true or pass in response", response)
        else:
            self.log_test("Payment Verification with Pass Purchase", False, 
                        f"Payment verification failed with status {status}", response)
    
    async def test_get_my_passes(self):
        """Test 4: Get My Passes (Passenger User)"""
        if not self.passenger_token:
            self.log_test("Get My Passes", False, "No passenger token available")
            return
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        
        success, response, status = await self.make_request(
            "GET", "/passes/my-passes", headers=headers, expect_status=200
        )
        
        if success:
            if "passes" in response and isinstance(response["passes"], list):
                passes = response["passes"]
                if len(passes) > 0:
                    # Check first pass structure
                    pass_data = passes[0]
                    required_fields = ["id", "plan_name", "total_passes", "remaining_passes", "valid_from", "valid_until"]
                    missing_fields = [field for field in required_fields if field not in pass_data]
                    
                    if missing_fields:
                        self.log_test("Get My Passes", False, 
                                    f"Missing pass fields: {missing_fields}", response)
                    else:
                        # Update pass_id if not set
                        if not self.test_data["pass_id"]:
                            self.test_data["pass_id"] = pass_data.get("id")
                        
                        self.log_test("Get My Passes", True, 
                                    f"Retrieved {len(passes)} passes. First pass: {pass_data.get('plan_name')}")
                else:
                    self.log_test("Get My Passes", True, "No passes found (empty list is valid)")
            else:
                self.log_test("Get My Passes", False, 
                            "Missing 'passes' array in response", response)
        else:
            self.log_test("Get My Passes", False, 
                        f"Failed to get passes with status {status}", response)
    
    async def test_create_booking_with_pass(self):
        """Test 5: Create Booking with Pass (Passenger User)"""
        if not self.passenger_token or not self.test_data["pass_id"]:
            self.log_test("Create Booking with Pass", False, 
                        "Missing passenger token or pass_id")
            return
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        journey_date = (datetime.now() + timedelta(days=1)).isoformat() + "Z"
        
        test_data = {
            "pass_id": self.test_data["pass_id"],
            "pickup_location": "Fortis Hospital, Kolkata",
            "dropoff_location": "Salt Lake Stadium",
            "journey_date": journey_date
        }
        
        success, response, status = await self.make_request(
            "POST", "/bookings/create", test_data, headers=headers, expect_status=200
        )
        
        if success:
            if response.get("success") and "booking" in response:
                booking = response["booking"]
                required_fields = ["id", "otp", "qr_code", "qr_data"]
                missing_fields = [field for field in required_fields if field not in booking]
                
                if missing_fields:
                    self.log_test("Create Booking with Pass", False, 
                                f"Missing booking fields: {missing_fields}", response)
                else:
                    # Store booking data for later tests
                    self.test_data["booking_id"] = booking.get("id")
                    self.test_data["otp"] = booking.get("otp")
                    self.test_data["qr_data"] = booking.get("qr_data")
                    
                    # Verify OTP is 6 digits
                    otp = booking.get("otp", "")
                    qr_code = booking.get("qr_code", "")
                    
                    if len(otp) == 6 and otp.isdigit():
                        if qr_code.startswith("data:image/png;base64,") or len(qr_code) > 100:
                            self.log_test("Create Booking with Pass", True, 
                                        f"Booking created: ID={booking.get('id')}, OTP={otp}, QR code generated")
                        else:
                            self.log_test("Create Booking with Pass", False, 
                                        f"QR code format invalid: {qr_code[:50]}...")
                    else:
                        self.log_test("Create Booking with Pass", False, 
                                    f"OTP format invalid: expected 6 digits, got '{otp}'")
            else:
                self.log_test("Create Booking with Pass", False, 
                            "Missing success=true or booking in response", response)
        else:
            self.log_test("Create Booking with Pass", False, 
                        f"Booking creation failed with status {status}", response)
    
    async def test_get_my_bookings(self):
        """Test 6: Get My Bookings (Passenger User)"""
        if not self.passenger_token:
            self.log_test("Get My Bookings", False, "No passenger token available")
            return
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        
        success, response, status = await self.make_request(
            "GET", "/bookings/my-bookings", headers=headers, expect_status=200
        )
        
        if success:
            if "bookings" in response and isinstance(response["bookings"], list):
                bookings = response["bookings"]
                if len(bookings) > 0:
                    # Check first booking structure
                    booking = bookings[0]
                    required_fields = ["id", "pickup_location", "dropoff_location", "journey_date", "status"]
                    missing_fields = [field for field in required_fields if field not in booking]
                    
                    if missing_fields:
                        self.log_test("Get My Bookings", False, 
                                    f"Missing booking fields: {missing_fields}", response)
                    else:
                        self.log_test("Get My Bookings", True, 
                                    f"Retrieved {len(bookings)} bookings. First booking: {booking.get('pickup_location')} to {booking.get('dropoff_location')}")
                else:
                    self.log_test("Get My Bookings", True, "No bookings found (empty list is valid)")
            else:
                self.log_test("Get My Bookings", False, 
                            "Missing 'bookings' array in response", response)
        else:
            self.log_test("Get My Bookings", False, 
                        f"Failed to get bookings with status {status}", response)
    
    async def test_verify_otp_driver(self):
        """Test 7: Verify OTP (Driver User)"""
        # Login as driver
        self.driver_token = await self.login_user("driver@metrohail.com", "Driver@123")
        
        if not self.driver_token:
            self.log_test("Verify OTP (Driver)", False, "Failed to login as driver")
            return
        
        if not self.test_data["booking_id"] or not self.test_data["otp"]:
            self.log_test("Verify OTP (Driver)", False, "Missing booking_id or otp from previous test")
            return
        
        headers = {"Authorization": f"Bearer {self.driver_token}"}
        test_data = {
            "booking_id": self.test_data["booking_id"],
            "otp": self.test_data["otp"]
        }
        
        success, response, status = await self.make_request(
            "POST", "/bookings/verify-otp", test_data, headers=headers, expect_status=200
        )
        
        if success:
            if response.get("success") and response.get("message") == "Booking verified successfully":
                self.log_test("Verify OTP (Driver)", True, 
                            f"OTP {self.test_data['otp']} verified successfully for booking {self.test_data['booking_id']}")
            else:
                self.log_test("Verify OTP (Driver)", False, 
                            f"Unexpected response: {response}")
        else:
            self.log_test("Verify OTP (Driver)", False, 
                        f"OTP verification failed with status {status}", response)
    
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