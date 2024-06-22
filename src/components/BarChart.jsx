import React from "react";
import {
  BarChart, CartesianGrid, Bar, XAxis, YAxis, Tooltip, Legend
} from "recharts";

const RenderBarChart = ({ vehicleData }) => {
  const aggregatedData = vehicleData.reduce((acc, curr) => {
    const kendaraan = curr.parkiran.kendaraan;
    const status = curr.status;

    if (!acc[kendaraan]) {
      acc[kendaraan] = { name: kendaraan, masuk: 0, keluar: 0 };
    }

    if (status === "masuk") {
      acc[kendaraan].masuk += 1;
    } else if (status === "keluar") {
      acc[kendaraan].keluar += 1;
    }

    return acc;
  }, {});

  const chartData = Object.values(aggregatedData);

  return (
    <BarChart width={630} height={400} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="masuk" fill="#8884d8" />
      <Bar dataKey="keluar" fill="#82ca9d" />
    </BarChart>
  );
};

export default RenderBarChart;
