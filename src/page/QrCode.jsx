import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import QRCode from 'react-qr-code';
import Sidebar from "../components/Sidebar";
import { FcSearch } from 'react-icons/fc';
import { FaFilter } from 'react-icons/fa';

const QrCode = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('default');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('');
    const [qrType, setQrType] = useState('');
    const [error, setError] = useState(null);
    const [frontendError, setFrontendError] = useState(null);
    const [loading, setLoading] = useState(false);
    const filterRef = useRef(null);
    const [realtimeUsers, setRealtimeUsers] = useState([]);

    const fetchRealtimeUsers = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token not found in cookies');

            const allUsersResponse = await fetch('https://dioparkapp-production.up.railway.app/api/admin/parkiran/realtime', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!allUsersResponse.ok) {
                throw new Error(`HTTP error! status: ${allUsersResponse.status}`);
            }

            const allUsersData = await allUsersResponse.json();

            if (!Array.isArray(allUsersData)) {
                throw new TypeError('Expected an array of users');
            }

            setRealtimeUsers(allUsersData);
        } catch (error) {
            console.error('Error fetching realtime users:', error);
            setFrontendError('Unable to fetch real-time users. Please try again later.');
            hideFrontendErrorAfterTimeout();
        }
    }, []);

    useEffect(() => {
        fetchRealtimeUsers();

        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [fetchRealtimeUsers]);

    const handleCardClick = useCallback((type, blok_parkir = '') => {
        generateQrCode(type, blok_parkir);
        setIsOpen(true);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setQrCodeData('');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setIsFilterDropdownOpen(false);
    };

    const getFilteredUsers = useCallback(() => {
        if (!Array.isArray(realtimeUsers)) return [];

        let filteredUsers = realtimeUsers.filter(user =>
            user.blok_parkir.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.pengguna.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.pengguna.nomor_polisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.pengguna.detail_kendaraan.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filter === 'asc') {
            filteredUsers.sort((a, b) => a.pengguna.nama.localeCompare(b.pengguna.nama));
        } else if (filter === 'desc') {
            filteredUsers.sort((a, b) => b.pengguna.nama.localeCompare(a.pengguna.nama));
        } else if (filter === 'oldest') {
            filteredUsers.sort((a, b) => a.email - b.email);
        } else if (filter === 'newest') {
            filteredUsers.sort((a, b) => b.email - a.email);
        }

        return filteredUsers;
    }, [realtimeUsers, searchTerm, filter]);

    const generateQrCode = useCallback(async (type, blok_parkir) => {
        const token = Cookies.get('token');
        if (!token) {
            setError(new Error('Token not found in cookies'));
            hideErrorAfterTimeout();
            return;
        }

        let url = '';
        let options = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        let qrCodeData = {};

        if (type === 'motor') {
            url = 'https://dioparkapp-production.up.railway.app/api/parkiran/masuk/generate-qr/motor';
            options.method = 'GET';
        } else if (type === 'mobil') {
            url = 'https://dioparkapp-production.up.railway.app/api/parkiran/masuk/generate-qr/mobil';
            options.method = 'GET';
        } else if (type === 'exit') {
            url = 'https://dioparkapp-production.up.railway.app/api/parkiran/keluar/generate-qr/exit';
            options.method = 'POST';
            options.headers['Content-Type'] = 'application/json';
            qrCodeData.blok_parkir = blok_parkir;
            options.body = JSON.stringify(qrCodeData);
        }

        try {
            setLoading(true);
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (type === 'motor') {
                console.log('Scan In Motor:', result);
            } else if (type === 'mobil') {
                console.log('Scan In Mobil:', result);
            }

            if (type === 'exit') {
                console.log('Scan Out:', result);
            }

            setQrCodeData(JSON.stringify(result.data));
            setQrType(type);
        } catch (error) {
            setError(error);
            hideErrorAfterTimeout();
        } finally {
            setLoading(false);
        }
    }, []);

    const hideErrorAfterTimeout = () => {
        setTimeout(() => {
            setError(null);
        }, 3000);
    };

    const hideFrontendErrorAfterTimeout = () => {
        setTimeout(() => {
            setFrontendError(null);
        }, 3000);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6 bg-blue-100">
                <h1 className="text-2xl font-bold mb-4">Generate QR Code</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div
                        className="bg-white shadow-lg rounded-lg p-6 cursor-pointer"
                        onClick={() => handleCardClick('mobil')}
                    >
                        <h2 className="text-xl font-bold">Qrcode Car In</h2>
                    </div>
                    <div
                        className="bg-white shadow-lg rounded-lg p-6 cursor-pointer"
                        onClick={() => handleCardClick('motor')}
                    >
                        <h2 className="text-xl font-bold">Qrcode Motor In</h2>
                    </div>
                </div>

                <hr className="my-8 border-gray-300" />

                <div className="flex items-center justify-between my-4">
                    <h1 className="text-2xl font-bold">On Parking</h1>
                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="p-2 pl-10 border border-gray-300 rounded-lg"
                            />
                            <FcSearch className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xl" />
                        </div>
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                className="p-2 bg-gray-300 rounded-lg"
                            >
                                <FaFilter className="text-xl" />
                            </button>
                            {isFilterDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                                    <ul>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleFilterChange('asc')}
                                        >
                                            Ascending
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleFilterChange('desc')}
                                        >
                                            Descending
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleFilterChange('oldest')}
                                        >
                                            Oldest
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleFilterChange('newest')}
                                        >
                                            Newest
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {frontendError && (
                    <p className="text-red-500 mb-4">{frontendError}</p>
                )}

                <div className="grid grid-cols-1 gap-2">
                    {realtimeUsers.length === 0 ? (
                        <p className="text-center text-gray-500">Nothing User Active</p>
                    ) : (
                        getFilteredUsers().length > 0 ? (
                            <>
                                <div className="flex items-center bg-gray-800 text-white p-3 rounded-lg">
                                    <h3 className="flex-1 text-center font-bold">Blok Parkir</h3>
                                    <h3 className="flex-1 text-center font-bold">Nama Pengguna</h3>
                                    <h3 className="flex-1 text-center font-bold">Nomor Polisi</h3>
                                    <h3 className="flex-1 text-center font-bold">Detail Kendaraan</h3>
                                    <h3 className="w-24 text-center font-bold">Qr Out</h3>
                                </div>
                                {getFilteredUsers().map(user => (
                                    <div key={user.email} className="flex items-center bg-white shadow-lg rounded-lg p-3">
                                        <p className="flex-1 text-gray-600 text-center">{user.blok_parkir}</p>
                                        <p className="flex-1 text-gray-600 text-center">{user.pengguna.nama}</p>
                                        <p className="flex-1 text-gray-600 text-center">{user.pengguna.nomor_polisi}</p>
                                        <p className="flex-1 text-gray-600 text-center">{user.pengguna.detail_kendaraan}</p>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg w-24"
                                            onClick={() => handleCardClick('exit', user.blok_parkir)}
                                        >
                                            QR Out
                                        </button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-center text-gray-500">User not found</p>
                        )
                    )}
                </div>

                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg">
                            {loading ? (
                                <p>Loading...</p>
                            ) : qrCodeData ? (
                                <>
                                    <QRCode value={qrCodeData} size={256} />
                                    <p className="mt-4">QR Code {qrType === 'motor' ? 'Motor In' : qrType === 'mobil' ? 'Car In' : 'Exit'}</p>
                                </>
                            ) : (
                                <p>No QR Code Data</p>
                            )}
                            <button
                                className="mt-4 text-red-500 hover:text-red-700"
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg">
                            <p className="text-red-500">{error.message}</p>
                            <button
                                className="mt-4 text-red-500 hover:text-red-700"
                                onClick={() => setError(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QrCode;
