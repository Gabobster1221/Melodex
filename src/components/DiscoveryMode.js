// components/DiscoveryMode.js
import React, { useState, useEffect } from 'react';

const DiscoveryMode = ({ spotifyApi, topArtists, topGenres, popularityRange }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [discoverTracks, setDiscoverTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState([]);
  
  // Get unique genres from user's top artists
  const uniqueGenres = [...new Set(topGenres)].slice(0, 15);
  
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      alert("You can select up to 5 genres");
    }
  };
  
  const exploreGenres = async () => {
    if (selectedGenres.length === 0) return;
    
    setLoading(true);
    try {
      const response = await spotifyApi.getRecommendations({
        seed_genres: selectedGenres,
        min_popularity: popularityRange[0],
        max_popularity: popularityRange[1],
        limit: 20
      });
      
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
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedGenres.length > 0) {
      exploreGenres();
    }
  }, [selectedGenres, popularityRange]);
  
  return (
    <div className="discovery-mode">
      <h2>Discovery Mode</h2>
      <p>Explore new music by selecting genres you're interested in</p>
      
      <div className="genre-selector">
        <h3>Your Top Genres</h3>
        <div className="genre-tags">
          {uniqueGenres.map(genre => (
            <button
              key={genre}
              className={`genre-tag ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Discovering new music...</div>
      ) : (
        <>
          <div className="discovery-results">
            <h3>Discovered Tracks</h3>
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
          </div>
          
          <div className="related-artists">
            <h3>Artists You Might Like</h3>
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
          </div>
        </>
      )}
    </div>
  );
};

export default DiscoveryMode;