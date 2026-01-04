from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from services.osm_service import osm_service
from database import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("/search")
async def search_locations(
    q: str = Query(..., description="Search query"),
    lat: Optional[float] = Query(None, description="Latitude for proximity bias"),
    lon: Optional[float] = Query(None, description="Longitude for proximity bias"),
    limit: int = Query(10, description="Maximum number of results")
):
    """
    Search for locations using database and OpenStreetMap Nominatim
    """
    try:
        # First, search in our popular_locations database
        search_regex = {"$regex": q, "$options": "i"}
        db_locations = await db.popular_locations.find({
            "$or": [
                {"name": search_regex},
                {"address": search_regex},
                {"city": search_regex}
            ]
        }).limit(limit).to_list(limit)
        
        # Convert to response format
        locations = []
        for loc in db_locations:
            locations.append({
                "id": loc.get("id", str(loc.get("_id"))),
                "name": loc.get("name"),
                "address": loc.get("address"),
                "lat": loc.get("lat"),
                "lon": loc.get("lon"),
                "type": loc.get("type", "popular"),
                "city": loc.get("city", ""),
                "source": "database"
            })
        
        # If not enough results from database, try OSM
        if len(locations) < limit:
            try:
                osm_locations = await osm_service.search_locations(q, lat, lon, limit - len(locations))
                for osm_loc in osm_locations:
                    osm_loc["source"] = "osm"
                    locations.append(osm_loc)
            except Exception as osm_error:
                logger.warning(f"OSM search failed, using only database results: {osm_error}")
        
        return {
            "success": True,
            "data": locations,
            "count": len(locations)
        }
    except Exception as e:
        logger.error(f"Location search error: {e}")
        raise HTTPException(status_code=500, detail="Location search failed")

@router.get("/popular")
async def get_popular_locations(
    city: Optional[str] = Query(None, description="Filter by city"),
    type: Optional[str] = Query(None, description="Filter by location type"),
    limit: int = Query(20, description="Maximum number of results")
):
    """
    Get popular/suggested locations from database
    """
    try:
        query = {}
        if city:
            query["city"] = {"$regex": city, "$options": "i"}
        if type:
            query["type"] = type
            
        locations = await db.popular_locations.find(query).limit(limit).to_list(limit)
        
        result = []
        for loc in locations:
            result.append({
                "id": loc.get("id", str(loc.get("_id"))),
                "name": loc.get("name"),
                "address": loc.get("address"),
                "lat": loc.get("lat"),
                "lon": loc.get("lon"),
                "type": loc.get("type", "popular"),
                "city": loc.get("city", "")
            })
        
        return {
            "success": True,
            "data": result,
            "count": len(result)
        }
    except Exception as e:
        logger.error(f"Popular locations error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch popular locations")

@router.get("/geocode")
async def geocode_address(
    address: str = Query(..., description="Address to geocode"),
    country: Optional[str] = Query(None, description="Country code (e.g., 'us', 'in')")
):
    """
    Convert address to coordinates
    """
    try:
        result = await osm_service.geocode_address(address, country)
        if result:
            return {
                "success": True,
                "data": result
            }
        else:
            raise HTTPException(status_code=404, detail="Address not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        raise HTTPException(status_code=500, detail="Geocoding failed")

@router.get("/reverse-geocode")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Convert coordinates to address
    """
    try:
        result = await osm_service.reverse_geocode(lat, lon)
        if result:
            return {
                "success": True,
                "data": result
            }
        else:
            raise HTTPException(status_code=404, detail="Address not found for coordinates")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reverse geocoding error: {e}")
        raise HTTPException(status_code=500, detail="Reverse geocoding failed")

@router.get("/nearby-pois")
async def get_nearby_pois(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(1000, description="Search radius in meters"),
    types: Optional[str] = Query(None, description="Comma-separated POI types")
):
    """
    Find nearby points of interest
    """
    try:
        poi_types = types.split(",") if types else None
        pois = await osm_service.find_nearby_pois(lat, lon, radius, poi_types)
        return {
            "success": True,
            "data": pois,
            "count": len(pois)
        }
    except Exception as e:
        logger.error(f"POI search error: {e}")
        raise HTTPException(status_code=500, detail="POI search failed")

@router.get("/route")
async def calculate_route(
    start_lat: float = Query(..., description="Start latitude"),
    start_lon: float = Query(..., description="Start longitude"),
    end_lat: float = Query(..., description="End latitude"),
    end_lon: float = Query(..., description="End longitude")
):
    """
    Calculate route between two points
    """
    try:
        route = await osm_service.calculate_route(
            (start_lat, start_lon),
            (end_lat, end_lon)
        )
        if route:
            return {
                "success": True,
                "data": {
                    "distance_km": round(route["distance"] / 1000, 2),
                    "duration_minutes": round(route["duration"] / 60, 1),
                    "geometry": route["geometry"],
                    "steps": route["steps"]
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Route not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Route calculation error: {e}")
        raise HTTPException(status_code=500, detail="Route calculation failed")