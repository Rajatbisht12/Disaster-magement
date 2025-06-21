import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, useUser, SignIn } from '@clerk/clerk-react';
import * as api from './services/api';
import { useSocket } from './hooks/useSocket';
import DisasterMap from './components/DisasterMap';
import DisasterList from './components/DisasterList';
import DisasterForm from './components/DisasterForm';
import ReportForm from './components/ReportForm';
import './App.css';

function App() {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [resources, setResources] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);
  const [officialUpdates, setOfficialUpdates] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const { user } = useUser();

  const isAdmin = user?.publicMetadata?.role === 'admin';

  const fetchDisasters = async (tag = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDisasters(tag);
      setDisasters(res.data);
    } catch (error) {
      console.error("Error fetching disasters", error);
      setError("Failed to fetch disasters");
    } finally {
      setLoading(false);
    }
  };

  const fetchDisasterDetails = async (disaster) => {
    try {
      // Fetch related data
      if (disaster.location) {
        const { coordinates } = disaster.location;
        const resourcesRes = await api.getNearbyResources(disaster.id, coordinates[1], coordinates[0]);
        setResources(resourcesRes.data);
      }
      
      const socialMediaRes = await api.getSocialMedia(disaster.id);
      setSocialMedia(socialMediaRes.data);
      
      const updatesRes = await api.getOfficialUpdates(disaster.id);
      setOfficialUpdates(updatesRes.data);
      
      // TODO: Add reports API endpoint
      // const reportsRes = await api.getReports(disaster.id);
      // setReports(reportsRes.data);
    } catch (error) {
      console.error("Error fetching disaster details", error);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('disaster_updated', (updatedDisaster) => {
        setDisasters(prev => {
          if (updatedDisaster.deleted) {
            return prev.filter(d => d.id !== updatedDisaster.id);
          }
          const index = prev.findIndex(d => d.id === updatedDisaster.id);
          if (index > -1) {
            const newDisasters = [...prev];
            newDisasters[index] = updatedDisaster;
            return newDisasters;
          }
          return [...prev, updatedDisaster];
        });
      });

      socket.on('social_media_updated', ({ id, data }) => {
        if (selectedDisaster?.id === id) {
          setSocialMedia(data);
        }
      });

      socket.on('resources_updated', ({ id, data }) => {
        if (selectedDisaster?.id === id) {
          setResources(data);
        }
      });

      return () => {
        socket.off('disaster_updated');
        socket.off('social_media_updated');
        socket.off('resources_updated');
      };
    }
  }, [socket, selectedDisaster]);

  const handleSelectDisaster = async (disaster) => {
    setSelectedDisaster(disaster);
    setEditingDisaster(null);
    await fetchDisasterDetails(disaster);
  };
  
  const handleFormSubmit = () => {
    fetchDisasters();
    setEditingDisaster(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disaster?')) {
      return;
    }
    
    try {
      await api.deleteDisaster(id);
      fetchDisasters();
      if (selectedDisaster?.id === id) {
        setSelectedDisaster(null);
        setResources([]);
        setSocialMedia([]);
        setOfficialUpdates([]);
      }
    } catch (error) {
      console.error("Error deleting disaster", error);
      alert('Error deleting disaster. Please try again.');
    }
  };

  const handleReportSubmitted = () => {
    if (selectedDisaster) {
      fetchDisasterDetails(selectedDisaster);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Disaster Response Coordination Platform</h1>
        <div className="header-controls">
          <SignedIn>
            <span className="user-info">
              Welcome, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
              {isAdmin && <span className="admin-badge"> (Admin)</span>}
            </span>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignIn />
          </SignedOut>
        </div>
      </header>

      <main>
        <SignedIn>
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <div className="map-container">
            <DisasterMap disasters={disasters} resources={resources} />
          </div>
          
          <div className="content">
            <div className="sidebar">
              {isAdmin && (
                <DisasterForm 
                  selectedDisaster={editingDisaster} 
                  onFormSubmit={handleFormSubmit} 
                />
              )}
              
              <ReportForm 
                disasterId={selectedDisaster?.id}
                onReportSubmitted={handleReportSubmitted}
              />
              
              <DisasterList 
                disasters={disasters} 
                onSelect={handleSelectDisaster}
                onEdit={isAdmin ? setEditingDisaster : null}
                onDelete={isAdmin ? handleDelete : null}
                onFilter={fetchDisasters}
                loading={loading}
              />
            </div>
            
            <div className="details">
              {selectedDisaster ? (
                <div>
                  <h2>{selectedDisaster.title}</h2>
                  <p className="disaster-description">{selectedDisaster.description}</p>
                  <div className="disaster-meta">
                    <p><strong>Location:</strong> {selectedDisaster.location_name}</p>
                    <p><strong>Tags:</strong> {selectedDisaster.tags?.join(', ')}</p>
                    <p><strong>Created:</strong> {new Date(selectedDisaster.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="data-sections">
                    <section>
                      <h3>Nearby Resources</h3>
                      {resources.length > 0 ? (
                        <ul className="resource-list">
                          {resources.map(r => (
                            <li key={r.id} className="resource-item">
                              <strong>{r.name}</strong> ({r.type})
                              <br />
                              <small>{r.location_name}</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No resources found in the area.</p>
                      )}
                    </section>

                    <section>
                      <h3>Social Media Reports</h3>
                      {socialMedia.length > 0 ? (
                        <ul className="social-media-list">
                          {socialMedia.map((sm, i) => (
                            <li key={i} className="social-media-item">
                              <strong>{sm.user}</strong>: {sm.text}
                              <br />
                              <small>{new Date(sm.timestamp).toLocaleString()}</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No social media reports available.</p>
                      )}
                    </section>

                    <section>
                      <h3>Official Updates</h3>
                      {officialUpdates.length > 0 ? (
                        <ul className="updates-list">
                          {officialUpdates.map((u, i) => (
                            <li key={i} className="update-item">
                              <strong>{u.title}</strong>
                              <p>{u.body}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No official updates available.</p>
                      )}
                    </section>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <h3>Select a Disaster</h3>
                  <p>Choose a disaster from the list to view details, resources, and updates.</p>
                </div>
              )}
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}

export default App;
