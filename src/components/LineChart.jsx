import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const processData = (dataStream, timeRange) => {
  const transactions = {};
  const groupedEntries = {};
  const currentDate = new Date();

  dataStream.forEach(entry => {
    const date = entry.waktu_parkir.split('T')[0]; // Get the date part of the timestamp
    const entryDate = new Date(date);

    if (timeRange === '7days') {
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      if (entryDate < sevenDaysAgo) return;
    } else if (timeRange === '1month') {
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      if (entryDate < thirtyDaysAgo) return;
    } else if (timeRange === '1year') {
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      if (entryDate < oneYearAgo) return;
    }

    let key;
    if (timeRange === '1year') {
      // Group by month for 1 year range
      const month = (entryDate.getMonth() + 1).toString().padStart(2, '0');
      const year = entryDate.getFullYear();
      key = `${entry.email}_${entry.blok_parkir}_${year}-${month}`;
    } else {
      key = `${entry.email}_${entry.blok_parkir}_${date}`;
    }

    if (!groupedEntries[key]) {
      groupedEntries[key] = { masuk: 0, keluar: 0 };
    }

    if (entry.status === 'masuk') {
      groupedEntries[key].masuk += 1;
    } else if (entry.status === 'keluar') {
      groupedEntries[key].keluar += 1;
    }
  });

  Object.keys(groupedEntries).forEach(key => {
    const [email, block, date] = key.split('_');
    const { masuk, keluar } = groupedEntries[key];
    const validTransactions = Math.min(masuk, keluar);

    if (!transactions[date]) {
      transactions[date] = 0;
    }

    transactions[date] += validTransactions;
  });

  return Object.keys(transactions).map(date => ({
    waktu_parkir: date,
    total_transaksi: transactions[date],
  }));
};

// Function to process data and count valid "masuk" and "keluar" per hour for today
const processTodayData = (dataStream, startTime, endTime) => {
  const masukData = {};
  const keluarData = {};

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  dataStream.forEach(entry => {
    const dateTime = entry.waktu_parkir.split('T');
    const date = dateTime[0];
    const time = dateTime[1].split('.')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    if (date !== todayDate) return;

    const [hours, minutes] = time.split(':').map(Number);
    const entryMinutes = hours * 60 + minutes;

    if (entryMinutes < startMinutes || entryMinutes > endMinutes) return;

    const hour = hours;

    if (entry.status === 'masuk') {
      if (!masukData[hour]) {
        masukData[hour] = 0;
      }
      masukData[hour] += 1;
    } else if (entry.status === 'keluar') {
      if (!keluarData[hour]) {
        keluarData[hour] = 0;
      }
      keluarData[hour] += 1;
    }
  });

  const result = [];
  for (let hour = 0; hour < 24; hour++) {
    if (masukData[hour] || keluarData[hour]) {
      result.push({
        waktu_parkir: `${hour}:00`,
        masuk: masukData[hour] || 0,
        keluar: keluarData[hour] || 0,
      });
    }
  }

  return result;
};

const RenderLineChart = ({ dataStream, timeRange, startTime, endTime }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let data;
    if (timeRange === 'today') {
      data = processTodayData(dataStream, startTime, endTime);
    } else {
      data = processData(dataStream, timeRange);
    }

    data = data.sort((a, b) => a.waktu_parkir.localeCompare(b.waktu_parkir));

    console.log("Filtered Data:", data);  // Tambahkan log ini untuk debugging
    setFilteredData(data);
  }, [dataStream, timeRange, startTime, endTime]);

  const tickFormatter = (tick) => {
    if (timeRange === 'today') {
      return tick;
    } else if (timeRange === '7days' || timeRange === '1month') {
      return tick.split('-').slice(1).join('-'); // Format MM-DD
    } else if (timeRange === '1year') {
      const parts = tick.split('-');
      return `${parts[0]}-${parts[1].padStart(2, '0')}`; // Format YYYY-MM with leading zero
    } else {
      return tick.split('-')[0]; // Format YYYY
    }
  };

  return (
    <LineChart width={650} height={400} data={filteredData}>
      {timeRange === 'today' ? (
        <>
          <Line type="monotone" dataKey="masuk" stroke="#82ca9d" />
          <Line type="monotone" dataKey="keluar" stroke="#8884d8" />
        </>
      ) : (
        <Line type="monotone" dataKey="total_transaksi" stroke="#8884d8" />
      )}
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis 
        dataKey="waktu_parkir" 
        tickFormatter={tickFormatter}
      />
      <YAxis />
      <Tooltip 
        labelFormatter={(label) => {
          if (timeRange === 'today') {
            return label;
          } else if (timeRange === '7days' || timeRange === '1month') {
            return label.split('-').slice(1).join('-');
          } else if (timeRange === '1year') {
            const parts = label.split('-');
            return `${parts[0]}-${parts[1].padStart(2, '0')}`; // Format YYYY-MM with leading zero
          } else {
            return label.split('-')[0];
          }
        }}
      />
      <Legend />
    </LineChart>
  );
};

export default RenderLineChart;
