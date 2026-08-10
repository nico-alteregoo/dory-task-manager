import React, { useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import axiosClient from '../axiosClient';

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  const location = useLocation();

  useEffect(() => {
    // Fetch logged-in user details from /auth/me
    axiosClient
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch((err) => {
        // If token is invalid or expired, clear auth
        console.error('Failed to fetch user:', err);
        setToken(null);
        localStorage.removeItem('ACCESS_TOKEN');
      });
  }, []);

  // Redirect to login if token does not exist
  if (!token) {
    return <Navigate to="/login" />;
  }

  const onLogout = (e) => {
    e.preventDefault();
    // Clear token locally (JWT is stateless)
    setToken(null);
    localStorage.removeItem('ACCESS_TOKEN');
  };

  return (
    <div className="min-h-screen bg-[#F4F9F1] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between">
        <div>
          {/* Brand Logo / App Title */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#00B14F] flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <span className="font-extrabold text-lg text-gray-800 tracking-tight">
              Task Manager
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Link
              to="/tasks"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                location.pathname === '/tasks'
                  ? 'bg-[#00B14F] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#F4F9F1] hover:text-[#00B14F]'
              }`}
            >
              Tasks
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                location.pathname === '/dashboard'
                  ? 'bg-[#00B14F] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#F4F9F1] hover:text-[#00B14F]'
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* User Info & Logout (Mobile / Sidebar Bottom) */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-gray-800 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-red-500 font-semibold hover:underline ml-2"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center md:hidden">
          <span className="font-bold text-[#00B14F]">Task Manager</span>
          <button
            onClick={onLogout}
            className="text-xs font-semibold text-red-500 hover:underline"
          >
            Logout
          </button>
        </header>

        {/* Dynamic Route Content (Tasks.jsx, Dashboard.jsx, etc.) */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}