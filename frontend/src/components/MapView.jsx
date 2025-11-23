import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-green.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-green-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView = ({ 
  pickup = { lat: 37.7749, lon: -122.4194, address: "San Francisco" },
  destination = { lat: 37.7849, lon: -122.4094, address: "Destination" },
  route = null,
  drivers = [],
  center = null,
  zoom = 13,
  className = "h-64 w-full rounded-lg"
}) => {
  const mapCenter = center || [pickup.lat, pickup.lon];
  
  // Route coordinates for polyline
  const routeCoordinates = route?.geometry?.coordinates 
    ? route.geometry.coordinates.map(coord => [coord[1], coord[0]]) // Swap lon,lat to lat,lon
    : [[pickup.lat, pickup.lon], [destination.lat, destination.lon]];

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Pickup Marker */}
        <Marker position={[pickup.lat, pickup.lon]} icon={pickupIcon}>
          <Popup>
            <div>
              <strong>Pickup Location</strong><br />
              {pickup.address}
            </div>
          </Popup>
        </Marker>
        
        {/* Destination Marker */}
        <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
          <Popup>
            <div>
              <strong>Destination</strong><br />
              {destination.address}
            </div>
          </Popup>
        </Marker>
        
        {/* Route Polyline */}
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={4}
          opacity={0.7}
        />
        
        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.location.lat, driver.location.lon]}
          >
            <Popup>
              <div>
                <strong>{driver.name}</strong><br />
                Rating: ⭐ {driver.rating}<br />
                Vehicle: {driver.vehicle.make} {driver.vehicle.model}<br />
                ETA: {driver.eta}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;