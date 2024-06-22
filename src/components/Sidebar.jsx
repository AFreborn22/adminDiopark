import { Link } from 'react-router-dom';

function Sidebar() {
    const handleLogout = () => {
        window.location.href = "/";
    };

    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 text-xl font-bold mb-5">
                DioPark Admin
            </div>
            <nav className="flex-1 px-4">
                <ul>
                    <li className="my-2">
                        <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
                    </li>
                    <li className="my-2">
                        <Link to="/dashboard/qrcode" className="block py-2 px-4 rounded hover:bg-gray-700">Generate QR Code</Link>
                    </li>
                    <li className="my-2">
                        <Link to="/users" className="block py-2 px-4 rounded hover:bg-gray-700">Statistik</Link>
                    </li>
                    <li className="my-2">
                        <Link to="/manageuser" className="block py-2 px-4 rounded hover:bg-gray-700">Manage User</Link>
                    </li>
                </ul>
            </nav>
            <div className="p-4">
                <button 
                    onClick={handleLogout} 
                    className="w-full py-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
