#!/usr/bin/env python3
"""
Shuttle Booking Flow Test - QR Code and OTP Generation
Tests the specific shuttle booking flow requested in the review
"""

import asyncio
import aiohttp
import json
import sys
import base64
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

# Test configuration
BASE_URL = "https://ridehub-80.preview.emergentagent.com/api"

class ShuttleBookingTestSuite:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.passenger_token = None
        self.test_data = {
            "route_id": None,
            "booking_id": None,
            "otp": None,
            "qr_code": None,
            "qr_data": None
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
    
    async def login_passenger(self) -> bool:
        """Login as passenger user"""
        test_data = {"email": "passenger@gmail.com", "password": "Pass@123"}
        
        success, response, status = await self.make_request(
            "POST", "/auth/login", test_data, expect_status=200
        )
        
        if success and "access_token" in response:
            self.passenger_token = response["access_token"]
            self.log_test("Passenger Login", True, f"Logged in as passenger@gmail.com")
            return True
        else:
            self.log_test("Passenger Login", False, f"Failed to login with status {status}", response)
            return False
    
    async def get_shuttle_routes(self) -> bool:
        """Get shuttle routes and store first route ID"""
        success, response, status = await self.make_request(
            "GET", "/shuttles/routes", expect_status=200
        )
        
        if success:
            if "success" in response and response["success"] and "data" in response:
                routes = response["data"]
                if len(routes) > 0:
                    # Store first route ID
                    self.test_data["route_id"] = routes[0].get("id")
                    self.log_test("Get Shuttle Routes", True, 
                                f"Found {len(routes)} routes. Using route ID: {self.test_data['route_id']}")
                    return True
                else:
                    self.log_test("Get Shuttle Routes", False, "No routes found", response)
                    return False
            else:
                self.log_test("Get Shuttle Routes", False, "Invalid response format", response)
                return False
        else:
            self.log_test("Get Shuttle Routes", False, f"Failed with status {status}", response)
            return False
    
    def is_valid_base64(self, s: str) -> bool:
        """Check if string is valid base64"""
        try:
            if isinstance(s, str):
                # Check if it's a data URL format
                if s.startswith("data:image/png;base64,"):
                    s = s.split(",", 1)[1]
                
                # Try to decode
                decoded = base64.b64decode(s, validate=True)
                # Check if it's a reasonable size for an image (at least 100 bytes)
                return len(decoded) > 100
            return False
        except Exception:
            return False
    
    async def create_shuttle_booking(self) -> bool:
        """Create shuttle booking with specified parameters"""
        if not self.passenger_token or not self.test_data["route_id"]:
            self.log_test("Create Shuttle Booking", False, "Missing passenger token or route_id")
            return False
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        
        # Create journey date for tomorrow at 8:00 AM in ISO format
        tomorrow = datetime.now() + timedelta(days=1)
        journey_date = tomorrow.replace(hour=8, minute=0, second=0, microsecond=0).isoformat() + "Z"
        
        test_data = {
            "pickup_location": "DLF Phase 1",
            "dropoff_location": "Connaught Place",
            "journey_date": journey_date,
            "shuttle_id": None,
            "route_id": self.test_data["route_id"]
        }
        
        success, response, status = await self.make_request(
            "POST", "/bookings/create", test_data, headers=headers, expect_status=200
        )
        
        if success:
            if response.get("success") and "booking" in response:
                booking = response["booking"]
                
                # Check required fields
                required_fields = ["id", "otp", "qr_code", "qr_data", "status"]
                missing_fields = [field for field in required_fields if field not in booking]
                
                if missing_fields:
                    self.log_test("Create Shuttle Booking", False, 
                                f"Missing booking fields: {missing_fields}", response)
                    return False
                
                # Store booking data
                self.test_data["booking_id"] = booking.get("id")
                self.test_data["otp"] = booking.get("otp")
                self.test_data["qr_code"] = booking.get("qr_code")
                self.test_data["qr_data"] = booking.get("qr_data")
                
                # Verify booking status
                if booking.get("status") != "confirmed":
                    self.log_test("Create Shuttle Booking", False, 
                                f"Expected status 'confirmed', got '{booking.get('status')}'")
                    return False
                
                # Verify OTP is 6 digits
                otp = booking.get("otp", "")
                if not (len(otp) == 6 and otp.isdigit()):
                    self.log_test("Create Shuttle Booking", False, 
                                f"OTP should be 6 digits, got: '{otp}'")
                    return False
                
                # Verify QR code is valid base64
                qr_code = booking.get("qr_code", "")
                if not self.is_valid_base64(qr_code):
                    self.log_test("Create Shuttle Booking", False, 
                                f"QR code is not valid base64 format")
                    return False
                
                # Verify QR data exists
                qr_data = booking.get("qr_data", "")
                if not qr_data:
                    self.log_test("Create Shuttle Booking", False, "QR data is empty")
                    return False
                
                self.log_test("Create Shuttle Booking", True, 
                            f"Booking created successfully:\n" +
                            f"    - ID: {booking.get('id')}\n" +
                            f"    - OTP: {otp} (6 digits)\n" +
                            f"    - Status: {booking.get('status')}\n" +
                            f"    - QR Code: Valid base64 ({len(qr_code)} chars)\n" +
                            f"    - QR Data: {qr_data[:50]}...")
                return True
            else:
                self.log_test("Create Shuttle Booking", False, 
                            "Missing success=true or booking in response", response)
                return False
        else:
            self.log_test("Create Shuttle Booking", False, 
                        f"Booking creation failed with status {status}", response)
            return False
    
    async def verify_qr_code_format(self) -> bool:
        """Additional verification of QR code format"""
        if not self.test_data["qr_code"]:
            self.log_test("QR Code Format Verification", False, "No QR code to verify")
            return False
        
        qr_code = self.test_data["qr_code"]
        
        # Check if it's a data URL
        is_data_url = qr_code.startswith("data:image/png;base64,")
        
        # Extract base64 part
        if is_data_url:
            base64_part = qr_code.split(",", 1)[1]
        else:
            base64_part = qr_code
        
        # Verify base64 decoding
        try:
            decoded = base64.b64decode(base64_part, validate=True)
            
            # Check PNG signature (first 8 bytes)
            png_signature = b'\x89PNG\r\n\x1a\n'
            is_png = decoded.startswith(png_signature)
            
            details = f"QR Code Format Analysis:\n" + \
                     f"    - Is Data URL: {is_data_url}\n" + \
                     f"    - Base64 Length: {len(base64_part)} chars\n" + \
                     f"    - Decoded Size: {len(decoded)} bytes\n" + \
                     f"    - Is PNG: {is_png}"
            
            if len(decoded) > 100 and (is_png or len(decoded) > 1000):
                self.log_test("QR Code Format Verification", True, details)
                return True
            else:
                self.log_test("QR Code Format Verification", False, 
                            f"QR code seems invalid: {details}")
                return False
                
        except Exception as e:
            self.log_test("QR Code Format Verification", False, 
                        f"Base64 decode failed: {str(e)}")
            return False
    
    async def run_shuttle_booking_test(self):
        """Run the complete shuttle booking flow test"""
        print("🚀 Starting Shuttle Booking Flow Test - QR Code and OTP Generation")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print("Test User: passenger@gmail.com / Pass@123")
        print("=" * 80)
        print()
        
        await self.setup()
        
        try:
            # Step 1: Login as passenger
            if not await self.login_passenger():
                return False
            
            # Step 2: Get shuttle routes
            if not await self.get_shuttle_routes():
                return False
            
            # Step 3: Create shuttle booking
            if not await self.create_shuttle_booking():
                return False
            
            # Step 4: Additional QR code verification
            if not await self.verify_qr_code_format():
                return False
            
        finally:
            await self.teardown()
        
        # Print summary
        print("=" * 80)
        print("📊 SHUTTLE BOOKING TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All shuttle booking tests passed!")
            print("✅ QR code and OTP are being generated correctly")
            print(f"✅ Booking ID: {self.test_data['booking_id']}")
            print(f"✅ OTP: {self.test_data['otp']} (6 digits)")
            print(f"✅ QR Code: Valid base64 format")
            print(f"✅ Status: confirmed")
            return True
        else:
            print(f"\n⚠️ {total - passed} test(s) failed in shuttle booking flow.")
            return False

async def main():
    """Main test runner"""
    test_suite = ShuttleBookingTestSuite()
    success = await test_suite.run_shuttle_booking_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())