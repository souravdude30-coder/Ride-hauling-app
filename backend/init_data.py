import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import time

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def init_shuttle_routes():
    """Initialize shuttle routes for Indian system"""
    
    # Check if routes already exist
    existing_routes = await db.shuttle_routes.find().to_list(10)
    if existing_routes:
        print("Shuttle routes already exist, skipping initialization")
        return
    
    shuttle_routes = [
        {
            "id": "route_gurgaon_delhi",
            "name": "Gurgaon - Delhi Route",
            "description": "Daily office commute",
            "duration_min": 45,
            "duration_max": 60,
            "distance_km": 28,
            "price": 150,
            "pickup_hotspots": [
                {
                    "id": "p1",
                    "name": "DLF Phase 1",
                    "address": "DLF Phase 1, Gurgaon",
                    "lat": 28.4595,
                    "lon": 77.0266,
                    "pickup_time": "07:30"
                },
                {
                    "id": "p2", 
                    "name": "Cyber Hub",
                    "address": "Cyber Hub, Gurgaon",
                    "lat": 28.4955,
                    "lon": 77.0890,
                    "pickup_time": "07:45"
                },
                {
                    "id": "p3",
                    "name": "MG Road Metro",
                    "address": "MG Road Metro Station",
                    "lat": 28.4817,
                    "lon": 77.0910,
                    "pickup_time": "08:00"
                }
            ],
            "drop_hotspots": [
                {
                    "id": "d1",
                    "name": "Connaught Place",
                    "address": "Connaught Place, Delhi",
                    "lat": 28.6315,
                    "lon": 77.2167,
                    "drop_time": "09:15"
                },
                {
                    "id": "d2",
                    "name": "Rajiv Chowk Metro",
                    "address": "Rajiv Chowk Metro Station",
                    "lat": 28.6330,
                    "lon": 77.2194,
                    "drop_time": "09:30"
                },
                {
                    "id": "d3",
                    "name": "Khan Market",
                    "address": "Khan Market, Delhi",
                    "lat": 28.6006,
                    "lon": 77.2262,
                    "drop_time": "09:45"
                }
            ],
            "capacity": 45,
            "amenities": ["AC", "WiFi", "USB Charging", "Live Tracking"],
            "frequency_minutes": 15,
            "operating_start": "06:00",
            "operating_end": "23:00",
            "is_active": True
        },
        {
            "id": "route_noida_cp",
            "name": "Noida - CP Route", 
            "description": "Express route to Central Delhi",
            "duration_min": 35,
            "duration_max": 45,
            "distance_km": 22,
            "price": 120,
            "pickup_hotspots": [
                {
                    "id": "p4",
                    "name": "Sector 18 Metro",
                    "address": "Sector 18 Metro, Noida",
                    "lat": 28.5692,
                    "lon": 77.3265,
                    "pickup_time": "08:00"
                },
                {
                    "id": "p5",
                    "name": "Botanical Garden",
                    "address": "Botanical Garden Metro",
                    "lat": 28.5638,
                    "lon": 77.3346,
                    "pickup_time": "08:15"
                }
            ],
            "drop_hotspots": [
                {
                    "id": "d4",
                    "name": "Connaught Place",
                    "address": "Connaught Place, Delhi",
                    "lat": 28.6315,
                    "lon": 77.2167,
                    "drop_time": "09:15"
                },
                {
                    "id": "d5",
                    "name": "Barakhamba Road",
                    "address": "Barakhamba Road Metro",
                    "lat": 28.6278,
                    "lon": 77.2273,
                    "drop_time": "09:25"
                }
            ],
            "capacity": 45,
            "amenities": ["AC", "WiFi", "USB Charging", "Live Tracking"],
            "frequency_minutes": 20,
            "operating_start": "06:30",
            "operating_end": "22:30",
            "is_active": True
        },
        {
            "id": "route_mumbai_bkc",
            "name": "Mumbai - Andheri to BKC",
            "description": "Bandra Kurla Complex commute",
            "duration_min": 25,
            "duration_max": 35,
            "distance_km": 15,
            "price": 80,
            "pickup_hotspots": [
                {
                    "id": "p7",
                    "name": "Andheri East Metro",
                    "address": "Andheri East Metro Station",
                    "lat": 19.1136,
                    "lon": 72.8697,
                    "pickup_time": "08:30"
                },
                {
                    "id": "p8",
                    "name": "Powai",
                    "address": "Powai Bus Depot",
                    "lat": 19.1197,
                    "lon": 72.9063,
                    "pickup_time": "08:45"
                }
            ],
            "drop_hotspots": [
                {
                    "id": "d6",
                    "name": "BKC Bus Hub",
                    "address": "Bandra Kurla Complex",
                    "lat": 19.0596,
                    "lon": 72.8656,
                    "drop_time": "09:30"
                },
                {
                    "id": "d7",
                    "name": "Kurla Station",
                    "address": "Kurla Railway Station",
                    "lat": 19.0658,
                    "lon": 72.8794,
                    "drop_time": "09:45"
                }
            ],
            "capacity": 40,
            "amenities": ["AC", "WiFi", "USB Charging", "Live Tracking"],
            "frequency_minutes": 12,
            "operating_start": "07:00",
            "operating_end": "22:00",
            "is_active": True
        }
    ]
    
    # Insert routes
    result = await db.shuttle_routes.insert_many(shuttle_routes)
    print(f"Inserted {len(result.inserted_ids)} shuttle routes")

async def init_sample_drivers():
    """Initialize sample drivers"""
    
    existing_drivers = await db.drivers.find().to_list(10)
    if existing_drivers:
        print("Sample drivers already exist, skipping initialization")
        return
    
    sample_drivers = [
        {
            "id": "driver_1",
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "+1-555-0101",
            "license_number": "DL123456789",
            "vehicle": {
                "make": "Toyota",
                "model": "Camry",
                "color": "Silver",
                "plate": "ABC-123",
                "year": 2021,
                "capacity": 4
            },
            "rating": 4.8,
            "total_rides": 245,
            "years_driving": 3,
            "is_online": True,
            "is_available": True,
            "status": "online",
            "earnings_today": 185.50,
            "current_location": {
                "lat": 37.7749,
                "lon": -122.4194,
                "heading": 45
            }
        },
        {
            "id": "driver_2", 
            "name": "Maria Garcia",
            "email": "maria.garcia@example.com",
            "phone": "+1-555-0102",
            "license_number": "DL987654321",
            "vehicle": {
                "make": "Honda",
                "model": "Accord",
                "color": "Black",
                "plate": "XYZ-789",
                "year": 2020,
                "capacity": 4
            },
            "rating": 4.9,
            "total_rides": 312,
            "years_driving": 5,
            "is_online": True,
            "is_available": False,
            "status": "busy",
            "earnings_today": 210.25,
            "current_location": {
                "lat": 37.7849,
                "lon": -122.4094,
                "heading": 120
            }
        },
        {
            "id": "driver_3",
            "name": "Rajesh Kumar",
            "email": "rajesh.kumar@example.com", 
            "phone": "+91-98765-43210",
            "license_number": "DL456789123",
            "vehicle": {
                "make": "Maruti",
                "model": "Suzuki Swift",
                "color": "White",
                "plate": "HR26AB1234",
                "year": 2019,
                "capacity": 4
            },
            "rating": 4.7,
            "total_rides": 156,
            "years_driving": 2,
            "is_online": False,
            "is_available": True,
            "status": "offline",
            "earnings_today": 0,
            "current_location": None
        }
    ]
    
    result = await db.drivers.insert_many(sample_drivers)
    print(f"Inserted {len(result.inserted_ids)} sample drivers")

async def main():
    print("Initializing database with sample data...")
    await init_shuttle_routes()
    await init_sample_drivers()
    print("Database initialization complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())