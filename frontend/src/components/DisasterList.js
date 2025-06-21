import React, { useState } from 'react';

const DisasterList = ({ disasters, onSelect, onEdit, onDelete, onFilter, loading }) => {
  const [tag, setTag] = useState('');

  const handleFilter = () => {
    onFilter(tag);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  if (loading) {
    return (
      <div className="disaster-list">
        <h3>Disasters</h3>
        <div className="loading">Loading disasters...</div>
      </div>
    );
  }

  return (
    <div className="disaster-list">
      <h3>Disasters ({disasters.length})</h3>
      <div className="filter-section">
        <input 
          value={tag} 
          onChange={e => setTag(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Filter by tag (e.g., flood, earthquake)" 
        />
        <button onClick={handleFilter}>Filter</button>
        {tag && (
          <button onClick={() => { setTag(''); onFilter(''); }}>Clear</button>
        )}
      </div>
      
      {disasters.length === 0 ? (
        <div className="no-disasters">
          <p>No disasters found.</p>
          {tag && <p>Try clearing the filter or adding a new disaster.</p>}
        </div>
      ) : (
        <ul className="disasters-list">
          {disasters.map(d => (
            <li key={d.id} className="disaster-item" onClick={() => onSelect(d)}>
              <div className="disaster-header">
                <h4>{d.title}</h4>
                <div className="disaster-actions">
                  {onEdit && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(d); }}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(d.id); }}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="disaster-location">{d.location_name}</p>
              <div className="disaster-tags">
                {d.tags?.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <small className="disaster-date">
                {new Date(d.created_at).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DisasterList; 