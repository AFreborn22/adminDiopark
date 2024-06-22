import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ParkingLot from "../components/ParkingLot";
import ParkingLotMotor from "../components/ParkingLotMotor";

const HOST_DEV = 'http://localhost:3000';
const HOST_PROD = 'https://dioparkapp-production.up.railway.app';
const HOST = process.env.NODE_ENV === 'production' ? HOST_PROD : HOST_DEV;

function Dashboard() {
    const [parkingData, setParkingLot] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentParkiran, setCurrentParkiran] = useState(null);
    const [newParkiran, setNewParkiran] = useState({
        blok_parkir: '',
        lantai: '',
        kendaraan: '',
        // status tidak disertakan
    });
    const [error, setError] = useState(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [parkiranToDelete, setParkiranToDelete] = useState(null);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const fetchParkingSlots = async () => {
        try {
            const token = getCookie('token');
            if (!token) throw new Error('Token not found in cookies');
            const slotResponse = await fetch(`${HOST}/api/admin/parkiran`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const slotData = await slotResponse.json();
            console.log(slotData);
            setParkingLot(slotData);

            setTimeout(() => {
                console.log('Checking if log is printed');
            }, 1000);
        } catch (error) {
            console.error('Error fetching parking slots:', error);
        }
    };

    useEffect(() => {
        fetchParkingSlots();
    }, []);

    const handleAddParkiran = async () => {
        const token = getCookie('token');
        if (!token) {
            setError(new Error('Token not found in cookies'));
            hideErrorAfterTimeout();
            return;
        }

        try {
            const { status, ...newParkiranData } = newParkiran; // Hapus properti status
            newParkiranData.lantai = parseInt(newParkiran.lantai);

            console.log('Data to be sent:', newParkiranData);
            const response = await fetch(`${HOST}/api/admin/parkiran/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newParkiranData)
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Error:', result);
                setError(new Error(result.message || 'Something went wrong'));
                hideErrorAfterTimeout();
                return;
            }

            console.log('Parkiran added:', result);

            setIsPopupOpen(false);
            fetchParkingSlots();
        } catch (error) {
            setError(error);
            console.error('Error adding parkiran:', error);
            hideErrorAfterTimeout();
        }
    };

    const handleUpdateParkiran = async () => {
        const token = getCookie('token');
        if (!token) {
            setError(new Error('Token not found in cookies'));
            hideErrorAfterTimeout();
            return;
        }

        try {
            const response = await fetch(`${HOST}/api/admin/parkiran/${currentParkiran.blok_parkir}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lantai: currentParkiran.lantai,
                    kendaraan: currentParkiran.kendaraan,
                    status: currentParkiran.status
                })
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Error:', result);
                setError(new Error(result.message || 'Something went wrong'));
                hideErrorAfterTimeout();
                return;
            }

            console.log('Parkiran updated:', result);

            setIsPopupOpen(false);
            fetchParkingSlots();
        } catch (error) {
            setError(error);
            console.error('Error updating parkiran:', error);
            hideErrorAfterTimeout();
        }
    };

    const handleDeleteParkiran = async (blok_parkir) => {
        const token = getCookie('token');
        if (!token) {
            setError(new Error('Token not found in cookies'));
            hideErrorAfterTimeout();
            return;
        }

        try {
            // Step 1: Fetch related entries from `transaksi_parkir`
            const responseFetch = await fetch(`${HOST}/api/admin/transaksi_parkir/${blok_parkir}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (responseFetch.status === 404) {
                console.log('No related entries found, proceed with deletion');
            } else if (!responseFetch.ok) {
                const result = await responseFetch.json();
                console.error('Error fetching related entries:', result);
                setError(new Error(result.message || 'Something went wrong'));
                hideErrorAfterTimeout();
                return;
            } else {
                const relatedEntries = await responseFetch.json();

                // Step 2: Delete each related entry
                for (const entry of relatedEntries) {
                    const responseDelete = await fetch(`${HOST}/api/admin/transaksi_parkir/${entry.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!responseDelete.ok) {
                        const result = await responseDelete.json();
                        console.error('Error deleting related entry:', result);
                        setError(new Error(result.message || 'Something went wrong'));
                        hideErrorAfterTimeout();
                        return;
                    }
                }
            }

            // Step 3: Delete the parkiran after related entries are deleted
            const responseDeleteParkiran = await fetch(`${HOST}/api/admin/parkiran/${blok_parkir}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!responseDeleteParkiran.ok) {
                const result = await responseDeleteParkiran.json();
                console.error('Error deleting parkiran:', result);
                setError(new Error(result.message || 'Something went wrong'));
                hideErrorAfterTimeout();
                return;
            }

            console.log('Parkiran deleted:', blok_parkir);

            setIsPopupOpen(false);
            fetchParkingSlots();
        } catch (error) {
            console.error('Error deleting parkiran:', error);
            setError(new Error('Failed to delete parkiran'));
            hideErrorAfterTimeout();
        }
    };

    const hideErrorAfterTimeout = () => {
        setTimeout(() => {
            setError(null);
        }, 3000);
    };

    const handleEditClick = (parkiran) => {
        setCurrentParkiran({
            blok_parkir: parkiran.blok_parkir,
            lantai: parkiran.lantai,
            kendaraan: parkiran.kendaraan,
            status: parkiran.status
        });
        setIsEditMode(true);
        setIsPopupOpen(true);
    };

    const handleDeleteClick = (parkiran) => {
        setParkiranToDelete(parkiran.blok_parkir);
        setIsConfirmDeleteOpen(true);
    };

    const groupedData = parkingData.reduce((acc, curr) => {
        (acc[curr.lantai] = acc[curr.lantai] || []).push(curr);
        return acc;
    }, {});

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6 bg-blue-100 relative">
                <div className="absolute top-6 right-6">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => {
                            setIsPopupOpen(true);
                            setIsEditMode(false);
                            setCurrentParkiran(null);
                            setNewParkiran({ blok_parkir: '', lantai: '', kendaraan: '', status: '' });
                        }}
                    >
                        Add Parkiran
                    </button>
                </div>
                {Object.keys(groupedData).map((lantai) => (
                    <div key={lantai}>
                        <h1 className="text-2xl font-bold mb-4">Lantai {lantai}</h1>
                        {groupedData[lantai].length > 0 && (
                            <>
                                {lantai === '1' && (
                                    <ParkingLotMotor
                                        parkingData={groupedData[lantai].filter(slot => slot.kendaraan === 'Motor' || slot.kendaraan === '')}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                )}
                                {lantai === '2' && (
                                    <ParkingLot
                                        parkingData={groupedData[lantai].filter(slot => slot.kendaraan === 'Mobil' || slot.kendaraan === '')}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                )}
                                {lantai === '3' && (
                                    <ParkingLotMotor
                                        parkingData={groupedData[lantai].filter(slot => slot.kendaraan === 'Motor' || slot.kendaraan === '')}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                )}
                                {lantai === '4' && (
                                    <ParkingLot
                                        parkingData={groupedData[lantai].filter(slot => slot.kendaraan === 'Mobil' || slot.kendaraan === '')}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                )}
                            </>
                        )}
                    </div>
                ))}

                {isPopupOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="relative bg-white p-6 rounded-lg">
                            <button
                                className="absolute top-2 right-2 text-gray-600"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Parkiran' : 'Add Parkiran'}</h2>
                            <label className="block mb-2">
                                Parking Block:
                                <input
                                    type="text"
                                    value={isEditMode ? currentParkiran?.blok_parkir : newParkiran.blok_parkir}
                                    onChange={(e) => {
                                        if (isEditMode) {
                                            setCurrentParkiran({ ...currentParkiran, blok_parkir: e.target.value });
                                        } else {
                                            setNewParkiran({ ...newParkiran, blok_parkir: e.target.value });
                                        }
                                    }}
                                    className="border border-gray-300 p-2 rounded-lg w-full"
                                />
                            </label>
                            <label className="block mb-2">
                                Floor:
                                <select
                                    value={isEditMode ? currentParkiran?.lantai : newParkiran.lantai}
                                    onChange={(e) => {
                                        if (isEditMode) {
                                            setCurrentParkiran({ ...currentParkiran, lantai: parseInt(e.target.value) });
                                        } else {
                                            setNewParkiran({ ...newParkiran, lantai: parseInt(e.target.value) });
                                        }
                                    }}
                                    className="border border-gray-300 p-2 rounded-lg w-full"
                                >
                                    <option value="">Select Floor</option>
                                    <option value="1">Floor 1</option>
                                    <option value="2">Floor 2</option>
                                    <option value="3">Floor 3</option>
                                    <option value="4">Floor 4</option>
                                </select>
                            </label>
                            <label className="block mb-2">
                                Vehicle:
                                <select
                                    value={isEditMode ? currentParkiran?.kendaraan : newParkiran.kendaraan}
                                    onChange={(e) => {
                                        if (isEditMode) {
                                            setCurrentParkiran({ ...currentParkiran, kendaraan: e.target.value });
                                        } else {
                                            setNewParkiran({ ...newParkiran, kendaraan: e.target.value });
                                        }
                                    }}
                                    className="border border-gray-300 p-2 rounded-lg w-full"
                                >
                                    <option value="">Select Vehicle</option>
                                    <option value="Mobil">Car</option>
                                    <option value="Motor">Motorcycle</option>
                                </select>
                            </label>
                            {isEditMode && (
                                <label className="block mb-2">
                                    Status:
                                    <select
                                        value={currentParkiran?.status}
                                        onChange={(e) => setCurrentParkiran({ ...currentParkiran, status: e.target.value })}
                                        className="border border-gray-300 p-2 rounded-lg w-full"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </label>
                            )}
                            <button
                                className={`text-white px-4 py-2 rounded-lg mt-4 ${isEditMode ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                onClick={isEditMode ? handleUpdateParkiran : handleAddParkiran}
                            >
                                {isEditMode ? 'Update' : 'Add'}
                            </button>
                            {isEditMode && (
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4 ml-2"
                                    onClick={() => handleDeleteClick(currentParkiran)}
                                >
                                    Delete
                                </button>
                            )}
                            {error && <p className="text-red-500 mt-4">{error.message}</p>}
                        </div>
                    </div>
                )}

                {isConfirmDeleteOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
                            <p>Are you sure you want to delete this parking slot?</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    className="bg-gray-300 text-black px-4 py-2 rounded-lg mr-2"
                                    onClick={() => setIsConfirmDeleteOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                    onClick={() => {
                                        handleDeleteParkiran(parkiranToDelete);
                                        setIsConfirmDeleteOpen(false);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
