import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DashboardClient from './pages/DashboardClient.jsx';
import DashboardProvider from './pages/DashboardProvider.jsx';
import ServiceCreate from './pages/ServiceCreate.jsx';
import Verify from './pages/Verify.jsx';
import Profile from './pages/Profile.jsx';
import Verified from './pages/Verified.jsx';
import NewRequest from "./pages/NewRequest.jsx";
import Header from './components/Header.jsx';
import './styles/global.css';

function Private({ children, role }) {
  const token = localStorage.getItem('fixnow_token');
  const savedRole = localStorage.getItem('fixnow_role');
  if (!token) return <Navigate to="/login" replace />;
  if (role && savedRole !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route
          path="/dashboard/client"
          element={
            <Private role="CLIENT">
              <DashboardClient/>
            </Private>
          }
        />
        <Route
          path="/dashboard/provider"
          element={
            <Private role="PROVIDER">
              <DashboardProvider/>
            </Private>
          }
        />
        <Route
          path="/services/new"
          element={
            <Private role="PROVIDER">
              <ServiceCreate/>
            </Private>
          }
        />
        <Route path="/new-request" element={<NewRequest />} />
        <Route path="/verify" element={<Verify/>} />
        <Route
          path="/profile"
          element={
            <Private>
              <Profile/>
            </Private>
          }
        />
        <Route path="/verified" element={<Verified/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}