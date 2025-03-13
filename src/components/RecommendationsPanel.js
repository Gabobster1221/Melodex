// components/RecommendationsPanel.js
import React, { useState } from 'react';

const RecommendationsPanel = ({ recommendations, createPlaylist }) => {
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState("My Discoveries");

  const toggleTrackSelection = (track) => {
    if (selectedTracks.find(t => t.id === track.id)) {
      setSelectedTracks(selectedTracks.filter(t => t.id !== track.id));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleCreatePlaylist = () => {
    if (selectedTracks.length === 0) {
      alert("Please select at least one track!");
      return;
    }
    createPlaylist(playlistName, selectedTracks);
  };

  return (
    <div className="recommendations-panel">
      <h2>Personalized Recommendations</h2>
      
      <div className="playlist-creator">
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Playlist name"
        />
        <button onClick={handleCreatePlaylist}>
          Create Playlist ({selectedTracks.length} tracks)
        </button>
      </div>
      
      <div className="tracks-container">
        {recommendations.map(track => (
          <div 
            key={track.id}
            className={`track-card ${selectedTracks.find(t => t.id === track.id) ? 'selected' : ''}`}
            onClick={() => toggleTrackSelection(track)}
          >
            <img src={track.album.images[0]?.url} alt={track.album.name} />
            <div className="track-info">
              <h4>{track.name}</h4>
              <p>{track.artists.map(a => a.name).join(', ')}</p>
              <div className="popularity-indicator">
                <div 
                  className="popularity-bar" 
                  style={{width: `${track.popularity}%`}}
                ></div>
                <span>{track.popularity}% Popular</span>
              </div>
            </div>
            <audio 
              controls 
              src={track.preview_url}
              onClick={(e) => e.stopPropagation()}
            ></audio>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPanel;