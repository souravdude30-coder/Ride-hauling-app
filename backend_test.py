#!/usr/bin/env python3
"""
Backend RBAC Authentication System Test Suite
Tests RBAC authentication for all user roles and permissions
"""

import asyncio
import aiohttp
import json
import sys
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

# Test configuration
BASE_URL = "https://ridehub-80.preview.emergentagent.com/api"

class RBACAuthTestSuite:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.test_users = [
            {
                "role": "driver",
                "email": "driver@metrohail.com",
                "password": "Driver@123",
                "expected_role": "driver",
                "expected_permissions": [
                    "route:read", "passenger:read", "passenger:track",
                    "vehicle:read", "emergency:respond", "sos:access",
                    "communicate:assigned"
                ]
            },
            {
                "role": "fleet_manager", 
                "email": "fleet@company.com",
                "password": "Fleet@123",
                "expected_role": "fleet_manager",
                "expected_permissions": [
                    "fleet:read", "fleet:analytics", "driver:manage", "driver:read", 
                    "driver:assign", "vehicle:manage", "vehicle:read", "vehicle:track",
                    "route:manage", "route:read", "route:optimize", "passenger:read",
                    "passenger:track", "emergency:respond", "sos:access",
                    "communicate:assigned", "audit:read"
                ]
            },
            {
                "role": "corporate_admin",
                "email": "corporate@techcorp.com", 
                "password": "Corp@123",
                "expected_role": "corporate_admin",
                "expected_permissions": [
                    "corporate:manage", "corporate:read", "corporate:analytics",
                    "passenger:manage", "passenger:read", "passenger:track",
                    "route:read", "vehicle:read", "vehicle:track", "driver:read",
                    "emergency:respond", "sos:access", "communicate:assigned"
                ]
            },
            {
                "role": "master_admin",
                "email": "admin@metrohail.com",
                "password": "Admin@123", 
                "expected_role": "master_admin",
                "expected_permissions": [
                    "system:admin", "system:read", "fleet:manage", "fleet:read",
                    "fleet:analytics", "driver:manage", "driver:read", "driver:assign",
                    "vehicle:manage", "vehicle:read", "vehicle:track", "route:manage",
                    "route:read", "route:optimize", "passenger:manage", "passenger:read",
                    "passenger:track", "corporate:manage", "corporate:read", 
                    "corporate:analytics", "emergency:manage", "emergency:respond",
                    "sos:access", "communicate:all", "audit:read", "logs:read"
                ]
            }
        ]
        
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
    
    async def test_user_login(self, user_data: Dict) -> Optional[str]:
        """Test user login and return token if successful"""
        test_name = f"{user_data['role'].title()} Login"
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response, status = await self.make_request(
            "POST", "/auth/login", login_data, expect_status=200
        )
        
        if success:
            # Check response structure
            required_fields = ["access_token", "token_type", "user"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test(test_name, False, 
                            f"Missing fields in login response: {missing_fields}", response)
                return None
            
            # Verify token type
            if response.get("token_type") != "bearer":
                self.log_test(test_name, False, 
                            f"Expected token_type 'bearer', got '{response.get('token_type')}'", response)
                return None
            
            # Verify user data
            user_info = response.get("user", {})
            expected_role = user_data["expected_role"]
            actual_role = user_info.get("role")
            
            if actual_role != expected_role:
                self.log_test(test_name, False, 
                            f"Expected role '{expected_role}', got '{actual_role}'", response)
                return None
            
            # Verify user has required fields
            user_required_fields = ["id", "email", "name", "role", "permissions"]
            user_missing_fields = [field for field in user_required_fields if field not in user_info]
            
            if user_missing_fields:
                self.log_test(test_name, False, 
                            f"Missing user fields: {user_missing_fields}", response)
                return None
            
            # Verify permissions (check if expected permissions are subset of actual)
            actual_permissions = set(user_info.get("permissions", []))
            expected_permissions = set(user_data["expected_permissions"])
            missing_permissions = expected_permissions - actual_permissions
            
            if missing_permissions:
                self.log_test(test_name, False, 
                            f"Missing expected permissions: {list(missing_permissions)}", response)
                return None
            
            self.log_test(test_name, True, 
                        f"Login successful. Role: {actual_role}, Permissions: {len(actual_permissions)}")
            return response.get("access_token")
        
        else:
            self.log_test(test_name, False, 
                        f"Login failed with status {status}", response)
            return None
    
    async def test_auth_me_endpoint(self, user_data: Dict, token: str):
        """Test /auth/me endpoint with user token"""
        test_name = f"{user_data['role'].title()} /auth/me"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        success, response, status = await self.make_request(
            "GET", "/auth/me", headers=headers, expect_status=200
        )
        
        if success:
            # Verify response structure
            required_fields = ["id", "email", "name", "role", "permissions", "is_active"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test(test_name, False, 
                            f"Missing fields in /auth/me response: {missing_fields}", response)
                return
            
            # Verify role matches
            expected_role = user_data["expected_role"]
            actual_role = response.get("role")
            
            if actual_role != expected_role:
                self.log_test(test_name, False, 
                            f"Expected role '{expected_role}', got '{actual_role}'", response)
                return
            
            # Verify permissions
            actual_permissions = set(response.get("permissions", []))
            expected_permissions = set(user_data["expected_permissions"])
            missing_permissions = expected_permissions - actual_permissions
            
            if missing_permissions:
                self.log_test(test_name, False, 
                            f"Missing expected permissions: {list(missing_permissions)}", response)
                return
            
            # Verify user is active
            if not response.get("is_active", False):
                self.log_test(test_name, False, "User is not active", response)
                return
            
            self.log_test(test_name, True, 
                        f"User info retrieved. Email: {response.get('email')}, Active: {response.get('is_active')}")
        
        else:
            self.log_test(test_name, False, 
                        f"/auth/me failed with status {status}", response)
    
    async def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        test_name = "Invalid Credentials Rejection"
        
        invalid_login_data = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        success, response, status = await self.make_request(
            "POST", "/auth/login", invalid_login_data, expect_status=401
        )
        
        if success:
            # Should get 401 status for invalid credentials
            self.log_test(test_name, True, 
                        f"Invalid credentials properly rejected with status 401")
        else:
            self.log_test(test_name, False, 
                        f"Expected 401 status for invalid credentials, got {status}", response)
    
    async def test_invalid_token(self):
        """Test /auth/me with invalid token"""
        test_name = "Invalid Token Rejection"
        
        headers = {"Authorization": "Bearer invalid_token_12345"}
        
        success, response, status = await self.make_request(
            "GET", "/auth/me", headers=headers, expect_status=401
        )
        
        if success:
            # Should get 401 status for invalid token
            self.log_test(test_name, True, 
                        f"Invalid token properly rejected with status 401")
        else:
            self.log_test(test_name, False, 
                        f"Expected 401 status for invalid token, got {status}", response)
    
    async def test_missing_authorization_header(self):
        """Test /auth/me without authorization header"""
        test_name = "Missing Authorization Header"
        
        success, response, status = await self.make_request(
            "GET", "/auth/me", expect_status=401
        )
        
        if success:
            # Should get 401 status for missing auth header
            self.log_test(test_name, True, 
                        f"Missing authorization header properly rejected with status 401")
        else:
            self.log_test(test_name, False, 
                        f"Expected 401 status for missing auth header, got {status}", response)
    
    async def run_all_tests(self):
        """Run all RBAC authentication tests"""
        print("🚀 Starting Backend RBAC Authentication System Test Suite")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print("=" * 80)
        print()
        
        await self.setup()
        
        try:
            # Test each user role
            user_tokens = {}
            
            for user_data in self.test_users:
                # Test login
                token = await self.test_user_login(user_data)
                if token:
                    user_tokens[user_data["role"]] = token
                    # Test /auth/me endpoint
                    await self.test_auth_me_endpoint(user_data, token)
            
            # Test invalid scenarios
            await self.test_invalid_credentials()
            await self.test_invalid_token()
            await self.test_missing_authorization_header()
            
        finally:
            await self.teardown()
        
        # Print summary
        print("=" * 80)
        print("📊 RBAC AUTHENTICATION TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Group results by category
        login_tests = [r for r in self.test_results if "Login" in r["test"]]
        me_tests = [r for r in self.test_results if "/auth/me" in r["test"]]
        security_tests = [r for r in self.test_results if any(x in r["test"] for x in ["Invalid", "Missing"])]
        
        print(f"\nLogin Tests: {sum(1 for r in login_tests if r['success'])}/{len(login_tests)}")
        print(f"/auth/me Tests: {sum(1 for r in me_tests if r['success'])}/{len(me_tests)}")
        print(f"Security Tests: {sum(1 for r in security_tests if r['success'])}/{len(security_tests)}")
        
        if passed == total:
            print("\n🎉 All RBAC authentication tests passed! All user roles working correctly.")
            return True
        else:
            print(f"\n⚠️ {total - passed} test(s) failed. Please check the issues above.")
            
            # Show failed tests
            failed_tests = [r for r in self.test_results if not r["success"]]
            if failed_tests:
                print("\nFailed Tests:")
                for test in failed_tests:
                    print(f"  ❌ {test['test']}: {test['details']}")
            
            return False
    
async def main():
    """Main test runner"""
    test_suite = RBACAuthTestSuite()
    success = await test_suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())