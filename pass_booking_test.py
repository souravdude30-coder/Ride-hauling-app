#!/usr/bin/env python3
"""
Pass-based Booking Test - Verify booking with pass consumption
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Any
from datetime import datetime, timedelta

# Test configuration
BASE_URL = "https://ridehub-80.preview.emergentagent.com/api"

class PassBookingTestSuite:
    def __init__(self):
        self.session = None
        self.passenger_token = None
        self.test_data = {
            "pass_id": None,
            "route_id": None,
            "booking_id": None
        }
        
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        
    async def teardown(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
    
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
    
    async def login_and_check_passes(self):
        """Login and check if user has passes"""
        # Login
        login_data = {"email": "passenger@gmail.com", "password": "Pass@123"}
        success, response, status = await self.make_request("POST", "/auth/login", login_data)
        
        if not success or "access_token" not in response:
            print("❌ Failed to login")
            return False
        
        self.passenger_token = response["access_token"]
        print("✅ Logged in successfully")
        
        # Check passes
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        success, response, status = await self.make_request("GET", "/passes/my-passes", headers=headers)
        
        if success and "passes" in response:
            passes = response["passes"]
            print(f"📋 Found {len(passes)} passes")
            
            # Find a pass with remaining journeys
            for pass_obj in passes:
                remaining = pass_obj.get("remaining_passes", 0)
                if remaining > 0:
                    self.test_data["pass_id"] = pass_obj.get("id")
                    print(f"✅ Using pass: {pass_obj.get('plan_name')} (Remaining: {remaining})")
                    return True
            
            print("⚠️ No passes with remaining journeys found")
            return False
        else:
            print("❌ Failed to get passes")
            return False
    
    async def get_route_id(self):
        """Get first available route ID"""
        success, response, status = await self.make_request("GET", "/shuttles/routes")
        
        if success and "data" in response and len(response["data"]) > 0:
            self.test_data["route_id"] = response["data"][0].get("id")
            print(f"✅ Using route: {self.test_data['route_id']}")
            return True
        else:
            print("❌ Failed to get routes")
            return False
    
    async def create_booking_with_pass(self):
        """Create booking using a pass"""
        if not self.test_data["pass_id"] or not self.test_data["route_id"]:
            print("❌ Missing pass_id or route_id")
            return False
        
        headers = {"Authorization": f"Bearer {self.passenger_token}"}
        journey_date = (datetime.now() + timedelta(days=1)).replace(hour=8, minute=0, second=0, microsecond=0).isoformat() + "Z"
        
        booking_data = {
            "pass_id": self.test_data["pass_id"],
            "pickup_location": "DLF Phase 1",
            "dropoff_location": "Connaught Place", 
            "journey_date": journey_date,
            "route_id": self.test_data["route_id"]
        }
        
        success, response, status = await self.make_request("POST", "/bookings/create", booking_data, headers=headers)
        
        if success and response.get("success") and "booking" in response:
            booking = response["booking"]
            self.test_data["booking_id"] = booking.get("id")
            
            print(f"✅ Booking created with pass:")
            print(f"   - Booking ID: {booking.get('id')}")
            print(f"   - OTP: {booking.get('otp')}")
            print(f"   - Status: {booking.get('status')}")
            print(f"   - Pass ID: {booking.get('pass_id')}")
            return True
        else:
            print(f"❌ Booking creation failed: {response}")
            return False
    
    async def run_test(self):
        """Run the pass booking test"""
        print("🚀 Testing Pass-based Booking Flow")
        print("=" * 50)
        
        await self.setup()
        
        try:
            if await self.login_and_check_passes():
                if await self.get_route_id():
                    await self.create_booking_with_pass()
        finally:
            await self.teardown()

async def main():
    test_suite = PassBookingTestSuite()
    await test_suite.run_test()

if __name__ == "__main__":
    asyncio.run(main())