import React, { useState, useEffect, useCallback } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { 
  RecommendationsPanel, 
  PlaylistCreator, 
  DiscoveryMode, 
  // UserProfile, // Removed unused import
  PopularitySlider
} from './components';
import './App.css';

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi();

function App() {
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentView, setCurrentView] = useState('recommendations');
  const [popularityRange, setPopularityRange] = useState([0, 100]); // For filtering by popularity

  // Check token from URL or localStorage
  useEffect(() => {
    // First, check for token in the URL hash after login redirect
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        if (item) {
          const parts = item.split('=');
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
    
    // Remove the hash from the URL
    window.location.hash = '';

    // Check if token exists in URL and save it in localStorage
    const _token = hash.access_token;
    
    if (_token) {
      localStorage.setItem('spotify_token', _token); // Persist the token
      setToken(_token);
      spotifyApi.setAccessToken(_token);

      // Fetch user data and top artists/tracks
      spotifyApi.getMe().then(user => setUserInfo(user));
      spotifyApi.getMyTopArtists({ limit: 20, time_range: 'medium_term' })
        .then(data => setTopArtists(data.items));
      spotifyApi.getMyTopTracks({ limit: 20, time_range: 'medium_term' })
        .then(data => setTopTracks(data.items));
    }
  }, []);

  // Load token from localStorage if not available in URL
  useEffect(() => {
    const savedToken = localStorage.getItem('spotify_token');
    if (savedToken && !token) {
      setToken(savedToken);
      spotifyApi.setAccessToken(savedToken);

      // Fetch user data and top artists/tracks
      spotifyApi.getMe().then(user => setUserInfo(user));
      spotifyApi.getMyTopArtists({ limit: 20, time_range: 'medium_term' })
        .then(data => setTopArtists(data.items));
      spotifyApi.getMyTopTracks({ limit: 20, time_range: 'medium_term' })
        .then(data => setTopTracks(data.items));
    }
  }, [token]);

  // Using useCallback to memoize the function
  const generateRecommendations = useCallback(() => {
    const seedArtists = topArtists.slice(0, 2).map(artist => artist.id);
    const seedTracks = topTracks.slice(0, 3).map(track => track.id);

    spotifyApi.getRecommendations({
      seed_artists: seedArtists,
      seed_tracks: seedTracks,
      min_popularity: popularityRange[0],
      max_popularity: popularityRange[1],
      limit: 30
    }).then(data => setRecommendations(data.tracks));
  }, [topArtists, topTracks, popularityRange]);

  useEffect(() => {
    // Generate recommendations when top artists/tracks change or popularity filter changes
    if (topArtists.length && topTracks.length) {
      generateRecommendations();
    }
  }, [topArtists, topTracks, popularityRange, generateRecommendations]); // Added generateRecommendations to the dependency array

  const handleLogin = () => {
    // Spotify authorization
    const clientId = "230ef5ef590c435295b0b2edc58e7c66"; // Replace with your Spotify Developer Client ID
    const redirectUri = "http://localhost:3000/callback";
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-top-read",
      "playlist-modify-public",
      "playlist-modify-private"
    ];

    window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(" "))}&response_type=token`;
  };

  const createPlaylist = async (name, tracks) => {
    if (!userInfo) return;
    
    try {
      const playlist = await spotifyApi.createPlaylist(userInfo.id, {
        name,
        description: "Created with Music Discovery Tool",
        public: false
      });
      
      await spotifyApi.addTracksToPlaylist(
        playlist.id,
        tracks.map(track => track.uri)
      );
      
      alert(`Playlist "${name}" created successfully!`);
      return playlist;
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist.");
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <h1>Music Discovery Tool</h1>
        <p>Connect with your Spotify account to get personalized music recommendations</p>
        <button onClick={handleLogin} className="login-button">Connect to Spotify</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Music Discovery Tool</h1>
        {userInfo && (
          <div className="user-info">
            <img src={userInfo.images[0]?.url} alt="Profile" />
            <span>{userInfo.display_name}</span>
          </div>
        )}
      </header>
      
      <div className="navigation">
        <button onClick={() => setCurrentView('recommendations')}>Recommendations</button>
        <button onClick={() => setCurrentView('discovery')}>Discovery Mode</button>
        <button onClick={() => setCurrentView('playlists')}>Playlist Creator</button>
      </div>
      
      <PopularitySlider 
        value={popularityRange} 
        onChange={setPopularityRange} 
      />
      
      <main>
        {currentView === 'recommendations' && (
          <RecommendationsPanel 
            recommendations={recommendations} 
            createPlaylist={createPlaylist} 
          />
        )}
        
        {currentView === 'discovery' && (
          <DiscoveryMode 
            spotifyApi={spotifyApi} 
            topArtists={topArtists} 
            topGenres={topArtists.flatMap(artist => artist.genres)} 
            popularityRange={popularityRange}
          />
        )}
        
        {currentView === 'playlists' && (
          <PlaylistCreator 
            spotifyApi={spotifyApi} 
            recommendations={recommendations} 
            userInfo={userInfo}
            createPlaylist={createPlaylist}
          />
        )}
      </main>
    </div>
  );
}

export default App;