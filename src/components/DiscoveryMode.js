// components/DiscoveryMode.js
import React, { useState, useEffect, useCallback } from 'react';

const DiscoveryMode = ({ spotifyApi, topArtists, topGenres, popularityRange }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [discoverTracks, setDiscoverTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState([]);
  
  // Add console logs for debugging
  console.log("Top genres received:", topGenres);
  
  // Get unique genres from user's top artists
  const uniqueGenres = [...new Set(topGenres)].slice(0, 15);
  console.log("Unique genres:", uniqueGenres);
  
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      alert("You can select up to 5 genres");
    }
  };
  
  // Memoize the exploreGenres function with useCallback
  const exploreGenres = useCallback(async () => {
    console.log("Exploring genres:", selectedGenres);
    if (selectedGenres.length === 0) return;
    
    setLoading(true);
    try {
      console.log("Making API request with:", {
        seed_genres: selectedGenres,
        min_popularity: popularityRange[0],
        max_popularity: popularityRange[1]
      });
      
      const response = await spotifyApi.getRecommendations({
        seed_genres: selectedGenres,
        min_popularity: popularityRange[0],
        max_popularity: popularityRange[1],
        limit: 20
      });
      
      console.log("API response:", response);
      setDiscoverTracks(response.tracks);
      
      // Get related artists for more exploration
      if (response.tracks.length > 0) {
        const artistIds = [...new Set(response.tracks.flatMap(track => 
          track.artists.map(artist => artist.id)
        ))].slice(0, 3);
        
        const relatedArtistsPromises = artistIds.map(id => 
          spotifyApi.getArtistRelatedArtists(id)
        );
        
        const relatedArtistsResults = await Promise.all(relatedArtistsPromises);
        const allRelatedArtists = relatedArtistsResults.flatMap(result => result.artists);
        
        // Filter by popularity range and take unique artists
        const filteredArtists = allRelatedArtists.filter(artist => 
          artist.popularity >= popularityRange[0] && 
          artist.popularity <= popularityRange[1]
        );
        
        const uniqueArtists = filteredArtists.filter((artist, index, self) =>
          index === self.findIndex(a => a.id === artist.id)
        );
        
        setRelatedArtists(uniqueArtists.slice(0, 10));
      }
    } catch (error) {
      console.error("Error exploring genres:", error);
      alert("Error getting recommendations: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedGenres, popularityRange, spotifyApi]); // Added dependencies
  
  useEffect(() => {
    console.log("Selected genres changed:", selectedGenres);
    if (selectedGenres.length > 0) {
      exploreGenres();
    }
  }, [selectedGenres, popularityRange, exploreGenres]); // Added exploreGenres to dependency array
  
  return (
    <div className="discovery-mode">
      <h2>Discovery Mode</h2>
      <p>Explore new music by selecting genres you're interested in</p>
      
      <div className="genre-selector">
        <h3>Your Top Genres</h3>
        <div className="genre-tags">
          {uniqueGenres.length > 0 ? (
            uniqueGenres.map(genre => (
              <button
                key={genre}
                className={`genre-tag ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </button>
            ))
          ) : (
            <p>No genres found. Please listen to more music to generate recommendations.</p>
          )}
        </div>
        
        {/* Manual explore button */}
        <button 
          className="explore-button"
          onClick={() => exploreGenres()} 
          disabled={selectedGenres.length === 0 || loading}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: selectedGenres.length > 0 ? '#1DB954' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedGenres.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Exploring...' : 'Explore Selected Genres'}
        </button>
        
        <div style={{ marginTop: '10px' }}>
          {selectedGenres.length > 0 ? (
            <p>Selected: {selectedGenres.join(', ')}</p>
          ) : (
            <p>Select up to 5 genres to explore</p>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Discovering new music...</div>
      ) : (
        <>
          <div className="discovery-results">
            <h3>Discovered Tracks {discoverTracks.length > 0 ? `(${discoverTracks.length})` : ''}</h3>
            {discoverTracks.length > 0 ? (
              <div className="tracks-grid">
                {discoverTracks.map(track => (
                  <div key={track.id} className="discovery-track">
                    <img src={track.album.images[0]?.url} alt={track.album.name} />
                    <div>
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
                    <audio controls src={track.preview_url}></audio>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tracks found. Try selecting different genres or adjusting popularity range.</p>
            )}
          </div>
          
          <div className="related-artists">
            <h3>Artists You Might Like {relatedArtists.length > 0 ? `(${relatedArtists.length})` : ''}</h3>
            {relatedArtists.length > 0 ? (
              <div className="artists-grid">
                {relatedArtists.map(artist => (
                  <div key={artist.id} className="artist-card">
                    <img src={artist.images[0]?.url} alt={artist.name} />
                    <h4>{artist.name}</h4>
                    <p>{artist.genres.slice(0, 3).join(', ')}</p>
                    <div className="popularity-indicator">
                      <div 
                        className="popularity-bar" 
                        style={{width: `${artist.popularity}%`}}
                      ></div>
                      <span>{artist.popularity}% Popular</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No related artists found yet. Discover tracks first to see related artists.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DiscoveryMode;