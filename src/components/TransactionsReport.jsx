import React, { useEffect, useState } from "react";
import { FaCar, FaMotorcycle } from 'react-icons/fa';

const RenderReport = ({ totalTrans, allTrans }) => {
  const [motorCount, setMotorCount] = useState({ masuk: 0, keluar: 0 });
  const [carCount, setCarCount] = useState({ masuk: 0, keluar: 0 });

  useEffect(() => {
    const aggregatedData = allTrans.reduce((acc, curr) => {
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

    const dataByVehicle = Object.values(aggregatedData);
    
    const dataMotor = dataByVehicle.find(item => item.name === "Motor");
    const dataCar = dataByVehicle.find(item => item.name === "Mobil");

    setMotorCount(dataMotor || { masuk: 0, keluar: 0 });
    setCarCount(dataCar || { masuk: 0, keluar: 0 });
  }, [allTrans]);

  useEffect(() => {
    console.log("Ini data Motor", motorCount);
    console.log("Ini data Mobil", carCount);
  }, [motorCount, carCount]);

  return (
    <div className="w-25 h-44 shadow-md bg-white grid grid-cols-2 gap-10 rounded-lg mb-4 place-content-evenly border border-stone-500">
      <div className="text-center pr-3">
        <p className="text-2xl font-bold">Total Transaksi</p>
        <p className="text-xl mt-2">{totalTrans}</p>
      </div>
      <div className="grid grid-cols-2 w-11/12 h-full">
        <div>
          <p className="text-center text-2xl text-green-400">Masuk</p>
          <div className="flex items-center justify-center mt-2">
            <FaCar className="text-green-400 text-2xl mr-1" />
            <p className="mr-3 ">{carCount.masuk}</p>
            <FaMotorcycle className="text-green-400 text-2xl mr-1" />
            <p>{motorCount.masuk}</p>
          </div>
        </div>
        <div>
          <p className="text-center text-2xl text-red-600">Keluar</p>
          <div className="flex items-center justify-center mt-2">
            <FaCar className="text-red-600 text-2xl mr-1" />
            <p className="mr-3">{carCount.keluar}</p>
            <FaMotorcycle className="text-red-600 text-2xl mr-1" />
            <p>{motorCount.keluar}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenderReport;
