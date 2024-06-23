import { FaCar } from 'react-icons/fa';
import { useEffect, useState } from 'react';

function ParkingLot({ parkingData, onEditClick, onDeleteClick }) {
    const [secondFloor, setSecondFloor] = useState([]);

    useEffect(() => {
        if (parkingData) {
            setSecondFloor(parkingData);
        }
    }, [parkingData]);

    const isUnavailable = (slot) => {
        return slot ? slot.status === 'unavailable' : false;
    };

    return (
        <div>
            <div className="grid grid-cols-5 gap-4">
                {secondFloor.map((slot, index) => (
                    <div
                        key={index}
                        className={`w-25 h-20 flex flex-col items-center justify-center rounded-lg shadow-lg border ${isUnavailable(slot) ? 'bg-red-500 border-red-700' : 'bg-green-500 border-green-700'
                            }`}
                        onClick={() => onEditClick(slot)}
                    >
                        <FaCar className="text-white text-2xl" />
                        <span className="text-white text-sm">{slot.blok_parkir}</span>
                        <span className="text-white text-sm">{isUnavailable(slot) ? 'Unavailable' : 'Available'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ParkingLot;
