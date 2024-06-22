import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import Sidebar from "../components/Sidebar";
import { FcSearch } from 'react-icons/fc';
import { FaFilter, FaTrash, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

const ManageUser = () => {
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('default');
    const [error, setError] = useState(null);
    const [frontendError, setFrontendError] = useState(null);
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        email: '',
        nama: '',
        username: '',
        password: '',
        nomor_polisi: '',
        detail_kendaraan: ''
    });
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const filterRef = useRef(null);

    const fetchUsers = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token not found in cookies');

            const response = await fetch('https://dioparkapp-production.up.railway.app/api/manage/pengguna/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new TypeError('Expected an array of users');
            }

            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setFrontendError('Unable to fetch users. Please try again later.');
            hideFrontendErrorAfterTimeout();
        }
    }, []);

    useEffect(() => {
        fetchUsers();

        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [fetchUsers]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setIsFilterDropdownOpen(false);
    };

    const getFilteredUsers = useCallback(() => {
        if (!Array.isArray(users)) return [];

        let filteredUsers = users.filter(user =>
            (user.nama && user.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.nomor_polisi && user.nomor_polisi.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.detail_kendaraan && user.detail_kendaraan.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filter === 'asc') {
            filteredUsers.sort((a, b) => a.nama.localeCompare(b.nama));
        } else if (filter === 'desc') {
            filteredUsers.sort((a, b) => b.nama.localeCompare(a.nama));
        } else if (filter === 'oldest') {
            filteredUsers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (filter === 'newest') {
            filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filteredUsers;
    }, [users, searchTerm, filter]);

    const handleDeleteClick = (email) => {
        setUserToDelete(email);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteUser = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token not found in cookies');

            const response = await fetch(`https://dioparkapp-production.up.railway.app/api/manage/pengguna/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({ email: userToDelete })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setUsers(users.filter(user => user.email !== userToDelete));
            setIsDeleteConfirmOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error);
            hideErrorAfterTimeout();
        }
    };

    const handleAddUser = async () => {
        if (!newUser.email || !newUser.nama || !newUser.username || !newUser.password || !newUser.nomor_polisi || !newUser.detail_kendaraan) {
            setFrontendError('All fields must be filled');
            hideFrontendErrorAfterTimeout();
            return;
        }

        try {
            const token = Cookies.get('token');
            if (!token) throw new Error('Token not found in cookies');

            const response = await fetch('https://dioparkapp-production.up.railway.app/api/manage/pengguna/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setUsers([...users, data]);
            setIsAddUserOpen(false);
            setNewUser({
                email: '',
                nama: '',
                username: '',
                password: '',
                nomor_polisi: '',
                detail_kendaraan: ''
            });
        } catch (error) {
            console.error('Error adding user:', error);
            setError(error);
            hideErrorAfterTimeout();
        }
    };

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

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6 bg-blue-100">
                <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

                <div className="flex items-center justify-between my-4">
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
                    <button
                        onClick={() => setIsAddUserOpen(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <FaPlus className="mr-2" /> Add User
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {users.length === 0 ? (
                        <p className="text-center text-gray-500">No users found</p>
                    ) : (
                        getFilteredUsers().length > 0 ? (
                            <>
                                <div className="flex items-center bg-gray-800 text-white p-3 rounded-lg">
                                    {/* <h3 className="flex-1 text-center font-bold">Name</h3> */}
                                    {/* <h3 className="flex-1 text-center font-bold">Email</h3> */}
                                    <h3 className="flex-1 text-center font-bold">Username</h3>
                                    <h3 className="flex-1 text-center font-bold">Nomor Polisi</h3>
                                    <h3 className="flex-1 text-center font-bold">Detail Kendaraan</h3>
                                    <h3 className="w-24 text-center font-bold">Actions</h3>
                                </div>
                                {getFilteredUsers().map(user => (
                                    <div key={user.email} className="flex items-center bg-white shadow-lg rounded-lg p-3">
                                        {/* <p className="flex-1 text-gray-600 text-center">{user.nama}</p> */}
                                        {/* <p className="flex-1 text-gray-600 text-center">{user.email}</p> */}
                                        <p className="flex-1 text-gray-600 text-center">{user.username}</p>
                                        <p className="flex-1 text-gray-600 text-center">{user.nomor_polisi}</p>
                                        <p className="flex-1 text-gray-600 text-center">{user.detail_kendaraan}</p>
                                        <div className="flex w-24 justify-around">
                                            <FaTrash
                                                className="text-red-500 cursor-pointer"
                                                onClick={() => handleDeleteClick(user.email)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-center text-gray-500">No users match your search</p>
                        )
                    )}
                </div>

                {isAddUserOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Add New User</h2>
                            {frontendError && (
                                <div className="text-red-500 mb-4">{frontendError}</div>
                            )}
                            <input
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
                            />
                            <input
                                type="text"
                                placeholder="Name"
                                value={newUser.nama}
                                onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                                className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
                            />
                            <input
                                type="text"
                                placeholder="Username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
                            />
                            <div className="relative mb-2">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="p-2 border border-gray-300 rounded-lg w-full"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                    <button type="button" onClick={toggleShowPassword} className="focus:outline-none">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Nomor Polisi"
                                value={newUser.nomor_polisi}
                                onChange={(e) => setNewUser({ ...newUser, nomor_polisi: e.target.value })}
                                className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
                            />
                            <input
                                type="text"
                                placeholder="Detail Kendaraan"
                                value={newUser.detail_kendaraan}
                                onChange={(e) => setNewUser({ ...newUser, detail_kendaraan: e.target.value })}
                                className="mb-4 p-2 border border-gray-300 rounded-lg w-full"
                            />
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                                onClick={handleAddUser}
                            >
                                Save
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                onClick={() => {
                                    setIsAddUserOpen(false);
                                    setFrontendError(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <p className="text-lg">Are you sure you want to delete this user?</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    className="bg-gray-300 text-black px-4 py-2 rounded-lg mr-2"
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                    onClick={confirmDeleteUser}
                                >
                                    Delete
                                </button>
                            </div>
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

export default ManageUser;
