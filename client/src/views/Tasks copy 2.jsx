import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../axiosClient';

export default function Tasks2() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Categories on mount (for dropdown filter & category name lookup)
  useEffect(() => {
    axiosClient.get('/categories')
      .then((res) => setCategories(res.data.categories || res.data || []))
      .catch((err) => console.log('Could not load categories', err));
  }, []);

  // Fetch Tasks on filter or page change
  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, categoryFilter, page]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/tasks', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          category_id: categoryFilter || undefined,
          page,
          limit: 6,
        },
      });
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axiosClient.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axiosClient.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  // Helper function to resolve category name for a given task
  const getCategoryName = (task) => {
    // 1. Direct model inclusion from backend
    if (task.Category?.name) return task.Category.name;
    if (task.category?.name) return task.category.name;

    // 2. Client-side state lookup by ID
    const catId = task.categoryId || task.category_id;
    if (catId) {
      const found = categories.find((c) => String(c.id) === String(catId));
      if (found) return found.name;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F4F9F1] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#00B14F]">My Tasks</h1>
            <p className="text-xs text-gray-500">Manage and track your everyday items</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/categories/new"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs px-4 py-2.5 rounded-full transition"
            >
              + New Category
            </Link>
            <Link
              to="/tasks/new"
              className="bg-[#00B14F] hover:bg-[#009643] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow transition active:scale-95"
            >
              + New Task
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F]"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm bg-white rounded-3xl border border-gray-100">
            No tasks found.
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => {
              const categoryName = getCategoryName(task);

              return (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>

                      {/* Category Badge */}
                      {categoryName && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                          {categoryName}
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-[#00B14F]' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {task.description && <p className="text-xs text-gray-500 mb-1">{task.description}</p>}
                    {task.dueDate && (
                      <span className="text-[10px] text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border border-gray-200 bg-[#F9FAFB] rounded-lg p-1.5 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-xs text-gray-500 hover:text-[#00B14F] px-2 py-1 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 p-1 text-sm transition"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs px-4 py-2 bg-white rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs px-4 py-2 bg-white rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}