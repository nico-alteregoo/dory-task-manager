import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../context/ContextProvider';

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
    <div className="max-w-xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">New Category</h1>
        <Link
          to="/tasks"
          className="text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-xl"
        >
          ← Back to Tasks
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Personal, Fitness"
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#00B14F] hover:bg-[#009643] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </div>
    </div>
  );
}