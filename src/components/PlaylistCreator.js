// components/PlaylistCreator.js
import React, { useState, useEffect } from 'react';

const PlaylistCreator = ({ spotifyApi, recommendations, userInfo, createPlaylist }) => {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState("My Curated Playlist");
  const [playlistDescription, setPlaylistDescription] = useState("Discovered with Music Discovery Tool");
  
  useEffect(() => {
    if (userInfo) {
      spotifyApi.getUserPlaylists(userInfo.id)
        .then(data => setUserPlaylists(data.items));
    }
  }, [userInfo, spotifyApi]);
  
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
    <div className="playlist-creator-panel">
      <h2>Playlist Creator</h2>
      
      <div className="playlist-form">
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Playlist name"
          className="playlist-input"
        />
        <textarea
          value={playlistDescription}
          onChange={(e) => setPlaylistDescription(e.target.value)}
          placeholder="Playlist description"
          className="playlist-textarea"
        ></textarea>
        <button 
          onClick={handleCreatePlaylist}
          className="create-playlist-button"
        >
          Create Playlist ({selectedTracks.length} tracks)
        </button>
      </div>
      
      <div className="playlist-tracks">
        <h3>Select Tracks for Your Playlist</h3>
        <div className="tracks-grid">
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
      
      <div className="your-playlists">
        <h3>Your Playlists</h3>
        <div className="playlists-grid">
          {userPlaylists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
              <img src={playlist.images[0]?.url} alt={playlist.name} />
              <h4>{playlist.name}</h4>
              <p>{playlist.tracks.total} tracks</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistCreator;