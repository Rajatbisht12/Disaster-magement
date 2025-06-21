const { logger } = require('../helpers');
const axios = require('axios');
const cheerio = require('cheerio');

// Mock data for testing
let mockDisasters = [
  {
    id: '1',
    title: 'NYC Flood',
    location_name: 'Manhattan, NYC',
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    description: 'Heavy flooding in Manhattan area',
    tags: ['flood', 'urgent'],
    owner_id: 'netrunnerX',
    created_at: new Date().toISOString(),
    audit_trail: []
  },
  {
    id: '2',
    title: 'California Earthquake',
    location_name: 'Los Angeles, CA',
    location: { type: 'Point', coordinates: [-118.2437, 34.0522] },
    description: 'Major earthquake affecting Los Angeles',
    tags: ['earthquake', 'emergency'],
    owner_id: 'reliefAdmin',
    created_at: new Date().toISOString(),
    audit_trail: []
  }
];

exports.createDisaster = async (req, res) => {
  try {
    const { title, location_name, location, description, tags } = req.body;
    const owner_id = req.auth?.userId || 'mock-user';
    
    const newDisaster = {
      id: Date.now().toString(),
      title,
      location_name,
      location,
      description,
      tags,
      owner_id,
      created_at: new Date().toISOString(),
      audit_trail: []
    };
    
    mockDisasters.push(newDisaster);
    
    if (global.io) {
      global.io.emit('disaster_updated', newDisaster);
    }
    
    logger.info('Disaster created', { id: newDisaster.id, user: owner_id });
    res.json(newDisaster);
  } catch (err) {
    logger.error('Error creating disaster', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;
    let filteredDisasters = mockDisasters;
    
    if (tag) {
      filteredDisasters = mockDisasters.filter(disaster => 
        disaster.tags && disaster.tags.includes(tag)
      );
    }
    
    res.json(filteredDisasters);
  } catch (err) {
    logger.error('Error fetching disasters', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const index = mockDisasters.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    mockDisasters[index] = { ...mockDisasters[index], ...updates };
    
    if (global.io) {
      global.io.emit('disaster_updated', mockDisasters[index]);
    }
    
    logger.info('Disaster updated', { id, user: req.auth?.userId || 'mock-user' });
    res.json(mockDisasters[index]);
  } catch (err) {
    logger.error('Error updating disaster', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const index = mockDisasters.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    
    mockDisasters.splice(index, 1);
    
    if (global.io) {
      global.io.emit('disaster_updated', { id, deleted: true });
    }
    
    logger.info('Disaster deleted', { id, user: req.auth?.userId || 'mock-user' });
    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting disaster', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock social media data
    const data = [
      { user: 'citizen1', text: 'Heavy flooding in downtown area #floodrelief', timestamp: new Date().toISOString() },
      { user: 'emergency_responder', text: 'Emergency services deployed to affected areas', timestamp: new Date().toISOString() },
      { user: 'local_news', text: 'Roads closed due to flooding. Stay safe everyone!', timestamp: new Date().toISOString() }
    ];
    
    if (global.io) {
      global.io.emit('social_media_updated', { id, data });
    }
    
    res.json(data);
  } catch (err) {
    logger.error('Error fetching social media', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getNearbyResources = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon } = req.query;
    
    // Mock resources data
    const mockResources = [
      { id: '1', name: 'Red Cross Shelter', location_name: 'Community Center', type: 'shelter' },
      { id: '2', name: 'Emergency Medical Station', location_name: 'City Hospital', type: 'medical' },
      { id: '3', name: 'Food Distribution Center', location_name: 'Local Church', type: 'food' }
    ];
    
    if (global.io) {
      global.io.emit('resources_updated', { id, data: mockResources });
    }
    
    res.json(mockResources);
  } catch (err) {
    logger.error('Error fetching resources', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getOfficialUpdates = async (req, res) => {
  try {
    // Mock official updates
    const updates = [
      { title: 'Emergency Declaration', body: 'State of emergency declared for affected areas. All non-essential travel is restricted.' },
      { title: 'Shelter Information', body: 'Emergency shelters are open at Community Center and City Hall. Bring essential items only.' },
      { title: 'Road Closures', body: 'Main Street and Highway 101 are closed due to flooding. Use alternate routes.' }
    ];
    res.json(updates);
  } catch (err) {
    logger.error('Error fetching updates', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.verifyImage = async (req, res) => {
  try {
    const { image_url } = req.body;
    // Mock Gemini API response
    const result = { 
      verified: Math.random() > 0.3, // 70% chance of being verified
      reason: Math.random() > 0.3 ? 'Image appears to show legitimate disaster context' : 'Image requires manual review'
    };
    res.json(result);
  } catch (err) {
    logger.error('Error verifying image', { error: err.message });
    res.status(500).json({ error: err.message });
  }
}; 