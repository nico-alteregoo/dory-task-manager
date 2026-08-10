import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../context/ContextProvider';
import { FiChevronLeft } from 'react-icons/fi';

export default function CategoryForm() {
  const navigate = useNavigate();
  const { setNotification } = useStateContext();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    axiosClient
      .post('/categories', { name })
      .then(() => {
        setLoading(false);
        if (setNotification) setNotification('Category created successfully!');
        navigate('/tasks');
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response?.data?.message || 'Failed to create category');
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <Link
        to="/tasks"
        className="text-xs font-semibold flex items-center gap-2 hover:text-gray-700 bg-white rounded-xl"
      >
        <FiChevronLeft />
        Back to Tasks
      </Link>
      <div className="flex items-center justify-between mt-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">New Category</h1>

      </div>

      {/* Form Card */}
      <div className="pl-2">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Personal, Fitness"
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B14F] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-[#4c7f1f] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </div>
    </div>
  );
}