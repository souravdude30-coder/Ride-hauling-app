"""
Initialize shuttle routes and popular locations for the ride-hailing app
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from datetime import datetime

async def init_shuttle_routes():
    """Initialize shuttle routes in the database"""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'ride_hailing')]
    
    # Clear existing routes
    await db.shuttle_routes.delete_many({})
    
    routes = [
        {
            "id": str(uuid.uuid4()),
            "name": "Gurgaon - Connaught Place Express",
            "description": "Daily commute service from Gurgaon to Connaught Place via MG Road",
            "source": "DLF Cyber City, Gurgaon",
            "destination": "Connaught Place, New Delhi",
            "source_lat": 28.4949,
            "source_lon": 77.0897,
            "destination_lat": 28.6315,
            "destination_lon": 77.2167,
            "stops": [
                {"name": "DLF Cyber City", "lat": 28.4949, "lon": 77.0897, "order": 1},
                {"name": "IFFCO Chowk", "lat": 28.4726, "lon": 77.0722, "order": 2},
                {"name": "MG Road Metro", "lat": 28.4807, "lon": 77.0876, "order": 3},
                {"name": "AIIMS", "lat": 28.5672, "lon": 77.2100, "order": 4},
                {"name": "Connaught Place", "lat": 28.6315, "lon": 77.2167, "order": 5}
            ],
            "distance_km": 32,
            "duration_minutes": 75,
            "fare": 80,
            "is_active": True,
            "timing": ["07:00", "08:00", "09:00", "17:30", "18:30", "19:30"],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Noida - Nehru Place Express",
            "description": "Daily commute service from Noida Sector 62 to Nehru Place",
            "source": "Sector 62, Noida",
            "destination": "Nehru Place, New Delhi",
            "source_lat": 28.6266,
            "source_lon": 77.3650,
            "destination_lat": 28.5509,
            "destination_lon": 77.2509,
            "stops": [
                {"name": "Sector 62 Noida", "lat": 28.6266, "lon": 77.3650, "order": 1},
                {"name": "Botanical Garden Metro", "lat": 28.5648, "lon": 77.3343, "order": 2},
                {"name": "Mayur Vihar", "lat": 28.5935, "lon": 77.2950, "order": 3},
                {"name": "Ashram", "lat": 28.5710, "lon": 77.2550, "order": 4},
                {"name": "Nehru Place", "lat": 28.5509, "lon": 77.2509, "order": 5}
            ],
            "distance_km": 28,
            "duration_minutes": 65,
            "fare": 70,
            "is_active": True,
            "timing": ["07:30", "08:30", "09:30", "17:00", "18:00", "19:00"],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Greater Noida - Connaught Place",
            "description": "Express shuttle from Greater Noida to Central Delhi",
            "source": "Alpha 1, Greater Noida",
            "destination": "Rajiv Chowk, New Delhi",
            "source_lat": 28.4744,
            "source_lon": 77.5030,
            "destination_lat": 28.6328,
            "destination_lon": 77.2197,
            "stops": [
                {"name": "Alpha 1 Greater Noida", "lat": 28.4744, "lon": 77.5030, "order": 1},
                {"name": "Pari Chowk", "lat": 28.4686, "lon": 77.4900, "order": 2},
                {"name": "Sector 18 Noida", "lat": 28.5707, "lon": 77.3219, "order": 3},
                {"name": "Akshardham", "lat": 28.6127, "lon": 77.2773, "order": 4},
                {"name": "Rajiv Chowk", "lat": 28.6328, "lon": 77.2197, "order": 5}
            ],
            "distance_km": 45,
            "duration_minutes": 90,
            "fare": 100,
            "is_active": True,
            "timing": ["06:30", "07:30", "08:30", "17:00", "18:00", "19:00"],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Faridabad - South Delhi",
            "description": "Shuttle service from Faridabad to South Delhi business hubs",
            "source": "NIT Faridabad",
            "destination": "Nehru Place, New Delhi",
            "source_lat": 28.3929,
            "source_lon": 77.2981,
            "destination_lat": 28.5509,
            "destination_lon": 77.2509,
            "stops": [
                {"name": "NIT Faridabad", "lat": 28.3929, "lon": 77.2981, "order": 1},
                {"name": "Badarpur Border", "lat": 28.5100, "lon": 77.3030, "order": 2},
                {"name": "Kalkaji", "lat": 28.5400, "lon": 77.2590, "order": 3},
                {"name": "Nehru Place", "lat": 28.5509, "lon": 77.2509, "order": 4}
            ],
            "distance_km": 22,
            "duration_minutes": 50,
            "fare": 60,
            "is_active": True,
            "timing": ["07:00", "08:00", "09:00", "17:30", "18:30", "19:30"],
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dwarka - Cyber Hub Gurgaon",
            "description": "Express shuttle from Dwarka to Gurgaon IT Hub",
            "source": "Dwarka Sector 21",
            "destination": "Cyber Hub, Gurgaon",
            "source_lat": 28.5521,
            "source_lon": 77.0588,
            "destination_lat": 28.4950,
            "destination_lon": 77.0891,
            "stops": [
                {"name": "Dwarka Sector 21", "lat": 28.5521, "lon": 77.0588, "order": 1},
                {"name": "Dwarka Mor", "lat": 28.5600, "lon": 77.0430, "order": 2},
                {"name": "Udyog Vihar", "lat": 28.5000, "lon": 77.0800, "order": 3},
                {"name": "Cyber Hub", "lat": 28.4950, "lon": 77.0891, "order": 4}
            ],
            "distance_km": 15,
            "duration_minutes": 40,
            "fare": 50,
            "is_active": True,
            "timing": ["07:00", "08:00", "09:00", "17:00", "18:00", "19:00"],
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.shuttle_routes.insert_many(routes)
    print(f"✅ Created {len(routes)} shuttle routes")
    return routes

async def init_popular_locations():
    """Initialize popular locations for autocomplete"""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'ride_hailing')]
    
    # Clear existing locations
    await db.popular_locations.delete_many({})
    
    locations = [
        # Delhi NCR Locations
        {"id": str(uuid.uuid4()), "name": "Connaught Place", "address": "Connaught Place, New Delhi", "lat": 28.6315, "lon": 77.2167, "type": "popular", "city": "Delhi"},
        {"id": str(uuid.uuid4()), "name": "India Gate", "address": "Rajpath, New Delhi", "lat": 28.6129, "lon": 77.2295, "type": "landmark", "city": "Delhi"},
        {"id": str(uuid.uuid4()), "name": "Nehru Place", "address": "Nehru Place, New Delhi", "lat": 28.5509, "lon": 77.2509, "type": "business", "city": "Delhi"},
        {"id": str(uuid.uuid4()), "name": "AIIMS Hospital", "address": "Sri Aurobindo Marg, New Delhi", "lat": 28.5672, "lon": 77.2100, "type": "hospital", "city": "Delhi"},
        {"id": str(uuid.uuid4()), "name": "Rajiv Chowk Metro", "address": "Connaught Place, New Delhi", "lat": 28.6328, "lon": 77.2197, "type": "metro", "city": "Delhi"},
        {"id": str(uuid.uuid4()), "name": "Delhi Airport T3", "address": "IGI Airport Terminal 3, New Delhi", "lat": 28.5562, "lon": 77.0998, "type": "airport", "city": "Delhi"},
        {"id": str(uuid.uuid4()), "name": "Saket Select Citywalk", "address": "Saket, New Delhi", "lat": 28.5280, "lon": 77.2190, "type": "mall", "city": "Delhi"},
        
        # Gurgaon Locations
        {"id": str(uuid.uuid4()), "name": "DLF Cyber City", "address": "DLF Phase 2, Gurgaon", "lat": 28.4949, "lon": 77.0897, "type": "business", "city": "Gurgaon"},
        {"id": str(uuid.uuid4()), "name": "Cyber Hub", "address": "DLF Cyber City, Gurgaon", "lat": 28.4950, "lon": 77.0891, "type": "popular", "city": "Gurgaon"},
        {"id": str(uuid.uuid4()), "name": "IFFCO Chowk Metro", "address": "IFFCO Chowk, Gurgaon", "lat": 28.4726, "lon": 77.0722, "type": "metro", "city": "Gurgaon"},
        {"id": str(uuid.uuid4()), "name": "MG Road Metro", "address": "MG Road, Gurgaon", "lat": 28.4807, "lon": 77.0876, "type": "metro", "city": "Gurgaon"},
        {"id": str(uuid.uuid4()), "name": "Ambience Mall", "address": "NH-8, Gurgaon", "lat": 28.5042, "lon": 77.0967, "type": "mall", "city": "Gurgaon"},
        {"id": str(uuid.uuid4()), "name": "Golf Course Road", "address": "Golf Course Road, Gurgaon", "lat": 28.4492, "lon": 77.0682, "type": "area", "city": "Gurgaon"},
        {"id": str(uuid.uuid4()), "name": "Udyog Vihar", "address": "Udyog Vihar, Gurgaon", "lat": 28.5000, "lon": 77.0800, "type": "business", "city": "Gurgaon"},
        
        # Noida Locations
        {"id": str(uuid.uuid4()), "name": "Sector 18 Noida", "address": "Sector 18, Noida", "lat": 28.5707, "lon": 77.3219, "type": "popular", "city": "Noida"},
        {"id": str(uuid.uuid4()), "name": "Sector 62 Noida", "address": "Sector 62, Noida", "lat": 28.6266, "lon": 77.3650, "type": "business", "city": "Noida"},
        {"id": str(uuid.uuid4()), "name": "Botanical Garden Metro", "address": "Sector 38, Noida", "lat": 28.5648, "lon": 77.3343, "type": "metro", "city": "Noida"},
        {"id": str(uuid.uuid4()), "name": "DLF Mall of India", "address": "Sector 18, Noida", "lat": 28.5679, "lon": 77.3211, "type": "mall", "city": "Noida"},
        {"id": str(uuid.uuid4()), "name": "Noida City Centre Metro", "address": "Sector 32, Noida", "lat": 28.5743, "lon": 77.3559, "type": "metro", "city": "Noida"},
        
        # Greater Noida Locations
        {"id": str(uuid.uuid4()), "name": "Alpha 1 Greater Noida", "address": "Alpha 1, Greater Noida", "lat": 28.4744, "lon": 77.5030, "type": "area", "city": "Greater Noida"},
        {"id": str(uuid.uuid4()), "name": "Pari Chowk", "address": "Pari Chowk, Greater Noida", "lat": 28.4686, "lon": 77.4900, "type": "popular", "city": "Greater Noida"},
        {"id": str(uuid.uuid4()), "name": "Knowledge Park", "address": "Knowledge Park, Greater Noida", "lat": 28.4700, "lon": 77.4800, "type": "business", "city": "Greater Noida"},
        
        # Faridabad Locations
        {"id": str(uuid.uuid4()), "name": "NIT Faridabad", "address": "NIT, Faridabad", "lat": 28.3929, "lon": 77.2981, "type": "area", "city": "Faridabad"},
        {"id": str(uuid.uuid4()), "name": "Crown Interiorz Mall", "address": "Sector 35, Faridabad", "lat": 28.4100, "lon": 77.3100, "type": "mall", "city": "Faridabad"},
        {"id": str(uuid.uuid4()), "name": "Badarpur Border", "address": "Badarpur, Delhi-Faridabad Border", "lat": 28.5100, "lon": 77.3030, "type": "area", "city": "Faridabad"},
        
        # Kolkata Locations (from screenshot - user seems to be in Kolkata area)
        {"id": str(uuid.uuid4()), "name": "Fortis Hospital Anandapur", "address": "730, Eastern Metropolitan Bypass, Anandapur, Kolkata", "lat": 22.5120, "lon": 88.4020, "type": "hospital", "city": "Kolkata"},
        {"id": str(uuid.uuid4()), "name": "Salt Lake City", "address": "Sector V, Salt Lake, Kolkata", "lat": 22.5744, "lon": 88.4344, "type": "business", "city": "Kolkata"},
        {"id": str(uuid.uuid4()), "name": "Park Street", "address": "Park Street, Kolkata", "lat": 22.5514, "lon": 88.3513, "type": "popular", "city": "Kolkata"},
        {"id": str(uuid.uuid4()), "name": "Howrah Station", "address": "Howrah Railway Station, Kolkata", "lat": 22.5839, "lon": 88.3423, "type": "railway", "city": "Kolkata"},
        {"id": str(uuid.uuid4()), "name": "Kolkata Airport", "address": "Netaji Subhas Chandra Bose International Airport", "lat": 22.6520, "lon": 88.4463, "type": "airport", "city": "Kolkata"},
    ]
    
    await db.popular_locations.insert_many(locations)
    print(f"✅ Created {len(locations)} popular locations")
    return locations

async def main():
    print("🚀 Initializing shuttle routes and locations...")
    print("-" * 50)
    await init_shuttle_routes()
    await init_popular_locations()
    print("-" * 50)
    print("✅ Initialization complete!")

if __name__ == "__main__":
    asyncio.run(main())
