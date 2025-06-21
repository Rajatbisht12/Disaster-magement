const { logger } = require('../helpers');

exports.geocodeLocation = async (req, res) => {
  try {
    const { location_text } = req.body;
    
    // Mock geocoding - return coordinates for common locations
    const mockGeocoding = {
      'Manhattan, NYC': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
      'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
      'Houston, TX': { lat: 29.7604, lng: -95.3698 },
      'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
      'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
      'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
      'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
      'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
      'San Jose, CA': { lat: 37.3382, lng: -121.8863 }
    };
    
    // Try to find exact match first
    let coordinates = mockGeocoding[location_text];
    
    // If no exact match, try partial matches
    if (!coordinates) {
      for (const [key, value] of Object.entries(mockGeocoding)) {
        if (location_text.toLowerCase().includes(key.toLowerCase().split(',')[0])) {
          coordinates = value;
          break;
        }
      }
    }
    
    // If still no match, return default coordinates (NYC)
    if (!coordinates) {
      coordinates = { lat: 40.7128, lng: -74.0060 };
      logger.info('No geocoding match found, using default coordinates', { location_text });
    }
    
    res.json({ 
      location: location_text, 
      lat: coordinates.lat, 
      lng: coordinates.lng 
    });
  } catch (err) {
    logger.error('Error in geocode', { error: err.message });
    res.status(500).json({ error: err.message });
  }
}; 