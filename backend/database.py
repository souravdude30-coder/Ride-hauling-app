from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
drivers_collection = db.drivers
rides_collection = db.rides
shuttle_routes_collection = db.shuttle_routes
shuttle_bookings_collection = db.shuttle_bookings
shuttle_buses_collection = db.shuttle_buses

# Make db available for imports
__all__ = ['db']