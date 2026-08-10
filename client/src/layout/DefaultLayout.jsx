import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import axiosClient from '../axiosClient';

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();

  // Redirect to login if user is not authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }

  const onLogout = (e) => {
    e.preventDefault();

    // Call logout endpoint (optional, based on your API) then clear local auth state
    axiosClient
      .post('/logout')
      .then(() => {
        setUser({});
        setToken(null);
      })
      .catch(() => {
        // Fallback: Clear token locally even if backend call fails
        setUser({});
        setToken(null);
      });
  };

  return (
    <div className="min-h-screen bg-[#F4F9F1]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3.5 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/tasks" className="text-lg font-black text-[#00B14F] tracking-tight">
            Dory Tasks
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user?.name && (
            <span className="text-xs font-medium text-gray-600 hidden sm:inline-block">
              Hi, <strong className="text-gray-800">{user.name}</strong>
            </span>
          )}

          <button
            onClick={onLogout}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-100 px-3.5 py-1.5 rounded-full transition active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}