import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DisasterMap = ({ disasters, resources }) => {
  const mapRef = useRef(null);
  const defaultPosition = [39.8283, -98.5795]; // Center of USA

  // Helper function to safely extract coordinates
  const getCoordinates = (location) => {
    if (!location || !location.coordinates) return null;
    const [lng, lat] = location.coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return [lat, lng];
  };

  // Get all valid coordinates for map bounds
  const getAllCoordinates = () => {
    const coords = [];
    
    disasters?.forEach(disaster => {
      const coord = getCoordinates(disaster.location);
      if (coord) coords.push(coord);
    });
    
    resources?.forEach(resource => {
      const coord = getCoordinates(resource.location);
      if (coord) coords.push(coord);
    });
    
    return coords;
  };

  // Update map bounds when data changes
  useEffect(() => {
    if (mapRef.current) {
      const allCoords = [
        ...(disasters || []).map(d => getCoordinates(d.location)),
        ...(resources || []).map(r => getCoordinates(r.location))
      ].filter(Boolean);

      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [disasters, resources]);

  return (
    <MapContainer 
      whenCreated={map => mapRef.current = map}
      center={defaultPosition} 
      zoom={4} 
      className="disaster-map"
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Disaster Markers */}
      {disasters?.map(disaster => {
        const coords = getCoordinates(disaster.location);
        return coords ? (
          <Marker 
            key={`disaster-${disaster.id}`} 
            position={coords}
            icon={L.divIcon({
              className: 'disaster-marker',
              html: '<div style="background-color: #dc3545; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [12, 12]
            })}
          >
            <Popup>
              <div className="marker-popup">
                <h4>{disaster.title}</h4>
                <p>{disaster.description}</p>
                <p><strong>Location:</strong> {disaster.location_name}</p>
                <p><strong>Tags:</strong> {disaster.tags?.join(', ')}</p>
              </div>
            </Popup>
          </Marker>
        ) : null;
      })}
      
      {/* Resource Markers */}
      {resources?.map(resource => {
        const coords = getCoordinates(resource.location);
        return coords ? (
          <Marker 
            key={`resource-${resource.id}`} 
            position={coords}
            icon={L.divIcon({
              className: 'resource-marker',
              html: '<div style="background-color: #28a745; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [10, 10]
            })}
          >
            <Popup>
              <div className="marker-popup">
                <h4>{resource.name}</h4>
                <p><strong>Type:</strong> {resource.type}</p>
                <p><strong>Location:</strong> {resource.location_name}</p>
              </div>
            </Popup>
          </Marker>
        ) : null;
      })}
    </MapContainer>
  );
};

// Use React.memo to prevent re-renders when props haven't changed
export default React.memo(DisasterMap); 