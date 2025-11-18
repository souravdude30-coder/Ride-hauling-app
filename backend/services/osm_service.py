import httpx
import asyncio
from typing import List, Dict, Optional, Tuple
from fastapi import HTTPException
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

class OSMService:
    def __init__(self):
        self.nominatim_url = "https://nominatim.openstreetmap.org"
        self.overpass_url = "https://overpass-api.de/api/interpreter"
        self.osrm_url = "https://router.project-osrm.org"
        self.timeout = 30
    
    async def geocode_address(self, address: str, country_code: str = None) -> Optional[Dict]:
        """
        Convert address to coordinates using Nominatim
        """
        try:
            params = {
                "q": address,
                "format": "json",
                "limit": 5,
                "addressdetails": 1,
                "extratags": 1
            }
            
            if country_code:
                params["countrycodes"] = country_code
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.nominatim_url}/search",
                    params=params,
                    headers={"User-Agent": "UberClone/1.0 (contact@uberclone.com)"}
                )
                response.raise_for_status()
                
                results = response.json()
                if results:
                    return {
                        "lat": float(results[0]["lat"]),
                        "lon": float(results[0]["lon"]),
                        "display_name": results[0]["display_name"],
                        "address": results[0].get("address", {}),
                        "boundingbox": results[0]["boundingbox"],
                        "all_results": results
                    }
                return None
                
        except httpx.RequestError as e:
            logger.error(f"Nominatim geocoding error: {e}")
            raise HTTPException(status_code=503, detail="Geocoding service unavailable")
        except Exception as e:
            logger.error(f"Unexpected geocoding error: {e}")
            return None
    
    async def reverse_geocode(self, lat: float, lon: float) -> Optional[Dict]:
        """
        Convert coordinates to address using Nominatim
        """
        try:
            params = {
                "lat": lat,
                "lon": lon,
                "format": "json",
                "addressdetails": 1
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.nominatim_url}/reverse",
                    params=params,
                    headers={"User-Agent": "UberClone/1.0 (contact@uberclone.com)"}
                )
                response.raise_for_status()
                
                result = response.json()
                return {
                    "display_name": result.get("display_name"),
                    "address": result.get("address", {})
                }
                
        except httpx.RequestError as e:
            logger.error(f"Reverse geocoding error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected reverse geocoding error: {e}")
            return None
    
    async def find_nearby_pois(self, lat: float, lon: float, radius: int = 1000, poi_types: List[str] = None) -> List[Dict]:
        """
        Find nearby points of interest using Overpass API
        """
        if poi_types is None:
            poi_types = ["restaurant", "hospital", "school", "bank", "fuel", "pharmacy", "shop"]
        
        # Create Overpass query
        poi_filters = "|".join([f'amenity="{poi}"' for poi in poi_types])
        
        query = f"""
        [out:json][timeout:25];
        (
          node[{poi_filters}](around:{radius},{lat},{lon});
          way[{poi_filters}](around:{radius},{lat},{lon});
        );
        out center meta;
        """
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.overpass_url,
                    data=query,
                    headers={"Content-Type": "text/plain"}
                )
                response.raise_for_status()
                
                data = response.json()
                pois = []
                
                for element in data.get("elements", []):
                    if "tags" in element:
                        poi_lat = element.get("lat")
                        poi_lon = element.get("lon")
                        
                        # For ways, use center coordinates
                        if not poi_lat and "center" in element:
                            poi_lat = element["center"]["lat"]
                            poi_lon = element["center"]["lon"]
                        
                        if poi_lat and poi_lon:
                            pois.append({
                                "id": element["id"],
                                "lat": poi_lat,
                                "lon": poi_lon,
                                "name": element["tags"].get("name", "Unknown"),
                                "amenity": element["tags"].get("amenity"),
                                "tags": element["tags"]
                            })
                
                return pois[:20]  # Limit to 20 POIs
                
        except httpx.RequestError as e:
            logger.error(f"Overpass API error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected POI search error: {e}")
            return []
    
    async def calculate_route(self, start_coords: Tuple[float, float], end_coords: Tuple[float, float], 
                            waypoints: List[Tuple[float, float]] = None) -> Optional[Dict]:
        """
        Calculate route between coordinates using OSRM
        """
        try:
            # Format coordinates for OSRM (lon,lat format)
            coords = [f"{start_coords[1]},{start_coords[0]}"]
            
            if waypoints:
                for wp in waypoints:
                    coords.append(f"{wp[1]},{wp[0]}")
            
            coords.append(f"{end_coords[1]},{end_coords[0]}")
            coordinates = ";".join(coords)
            
            params = {
                "overview": "full",
                "geometries": "geojson",
                "steps": "true"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.osrm_url}/route/v1/driving/{coordinates}",
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                
                if data["code"] == "Ok" and data["routes"]:
                    route = data["routes"][0]
                    return {
                        "distance": route["distance"],  # meters
                        "duration": route["duration"],  # seconds
                        "geometry": route["geometry"],
                        "steps": route["legs"][0]["steps"] if route["legs"] else [],
                        "waypoints": data.get("waypoints", [])
                    }
                
                return None
                
        except httpx.RequestError as e:
            logger.error(f"OSRM routing error: {e}")
            raise HTTPException(status_code=503, detail="Routing service unavailable")
        except Exception as e:
            logger.error(f"Unexpected routing error: {e}")
            return None
    
    async def search_locations(self, query: str, lat: float = None, lon: float = None, limit: int = 10) -> List[Dict]:
        """
        Search for locations with optional proximity bias
        """
        try:
            params = {
                "q": query,
                "format": "json",
                "limit": limit,
                "addressdetails": 1
            }
            
            # Add proximity bias if coordinates provided
            if lat and lon:
                params["lat"] = lat
                params["lon"] = lon
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.nominatim_url}/search",
                    params=params,
                    headers={"User-Agent": "UberClone/1.0 (contact@uberclone.com)"}
                )
                response.raise_for_status()
                
                results = response.json()
                locations = []
                
                for result in results:
                    locations.append({
                        "id": result["place_id"],
                        "name": result["display_name"].split(",")[0],
                        "address": result["display_name"],
                        "lat": float(result["lat"]),
                        "lon": float(result["lon"]),
                        "type": result.get("type", "location")
                    })
                
                return locations
                
        except httpx.RequestError as e:
            logger.error(f"Location search error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected search error: {e}")
            return []

# Global instance
osm_service = OSMService()