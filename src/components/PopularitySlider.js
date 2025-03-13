// components/PopularitySlider.js
import React from 'react';

const PopularitySlider = ({ value, onChange }) => {
  return (
    <div className="popularity-slider">
      <h3>Artist Popularity Filter</h3>
      <div className="slider-container">
        <label>Underground</label>
        <input
          type="range"
          min="0"
          max="40"
          value={value[0]}
          onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
        />
        <span>{value[0]}%</span>
      </div>
      <div className="slider-container">
        <label>Mainstream</label>
        <input
          type="range"
          min="40"
          max="100"
          value={value[1]}
          onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
        />
        <span>{value[1]}%</span>
      </div>
      <p className="slider-description">
        Adjust sliders to discover artists from underground (0-40% popularity) to mainstream (40-100% popularity)
      </p>
    </div>
  );
};

export default PopularitySlider;