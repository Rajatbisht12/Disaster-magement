import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

const DisasterForm = ({ selectedDisaster, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    location_name: ''
  });

  useEffect(() => {
    if (selectedDisaster) {
      setFormData({
        title: selectedDisaster.title,
        description: selectedDisaster.description,
        tags: selectedDisaster.tags.join(','),
        location_name: selectedDisaster.location_name
      });
    } else {
      setFormData({ title: '', description: '', tags: '', location_name: '' });
    }
  }, [selectedDisaster]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { location_name } = formData;
      const geocodeRes = await api.geocode(location_name);
      const location = {
        type: 'Point',
        coordinates: [geocodeRes.data.lng, geocodeRes.data.lat]
      };

      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
        location
      };

      if (selectedDisaster) {
        await api.updateDisaster(selectedDisaster.id, payload);
      } else {
        await api.createDisaster(payload);
      }
      onFormSubmit();
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{selectedDisaster ? 'Edit Disaster' : 'Create Disaster'}</h3>
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
      <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma-separated)" />
      <input name="location_name" value={formData.location_name} onChange={handleChange} placeholder="Location (e.g., 'City, Country')" required />
      <button type="submit">{selectedDisaster ? 'Update' : 'Create'}</button>
    </form>
  );
};

export default DisasterForm; 