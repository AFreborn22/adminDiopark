// src/components/TimeFilter.jsx
import React from 'react';

const FilterBox = ({ startTime, endTime, onStartTimeChange, onEndTimeChange }) => (
  <div className="mb-4 ml-5">
    <label className="block text-gray-700 text-xl font-bold mb-2">Filter Jam</label>
    <div className="flex space-x-4">
      <div>
        <label className="block text-gray-600 text-sm mb-1">Dari</label>
        <input
          type="time"
          value={startTime}
          onChange={e => onStartTimeChange(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div>
        <label className="block text-gray-600 text-sm mb-1">Ke</label>
        <input
          type="time"
          value={endTime}
          onChange={e => onEndTimeChange(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
    </div>
  </div>
);

export default FilterBox;
