import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import Notification from '../components/alertLogin';

const HOST_DEV = 'http://localhost:3000';
const HOST_PROD = 'https://dioparkapp-production.up.railway.app';
const HOST = process.env.NODE_ENV === 'production' ? HOST_PROD : HOST_DEV;

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    const handleUnameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        try {
            const response = await fetch(`${HOST}/api/auth/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();
            console.log(data);
            const adminAccount = data.admin;
            if (!response.ok) {
                throw new Error(data.message || 'Login Failed');
            }

            Cookies.remove('token');
            Cookies.set('token', data.token);

            if (username === adminAccount.username && password === adminAccount.password) {
                setNotification({ message: 'Anda berhasil login.', type: 'success' });
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            } else {
                setNotification({ message: 'Email atau password salah. Silakan coba lagi.', type: 'error' });
            }
        } catch (e) {
            setNotification({ message: e.message, type: 'error' });
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-36 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign in just with admin account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={username}
                                onChange={handleUnameChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
            {notification.message && (
                <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            )}
        </div>
    );
}

export default Login;
