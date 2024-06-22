// src/components/TimeRangeFilter.jsx
import React from 'react';

const TimeRangeFilter = ({ onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-xl font-bold mb-8 ">Time Range</label>
    <select
      className="block appearance-none w-11/12 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
      onChange={e => onChange(e.target.value)}
    >
      <option value="today">Hari ini</option>
      <option value="7days">7 Hari Terakhir</option>
      <option value="1month">30 Hari Terakhir</option>
      <option value="1year">1 Tahun Terakhir</option>
    </select>
  </div>
);

export default TimeRangeFilter;
