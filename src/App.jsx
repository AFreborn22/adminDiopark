import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import QrCode from "./page/QrCode";
import Users from "./page/Users";
import ManageUser from "./page/ManageUser";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/qrcode" element={<QrCode />} />
                <Route path="/users" element={<Users />} />
                <Route path="/manageuser" element={<ManageUser />} />
            </Routes>
        </Router>
    )
}

export default App

