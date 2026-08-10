import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../axiosClient';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters State
  const [search, setSearch] = useState('');       // what the user is typing right now
  const [searchTerm, setSearchTerm] = useState(''); // the debounced value actually sent to the API
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

  // Debounce: wait 400ms after the user stops typing before it counts as a real search.
  // Without this, every keystroke fired an API call.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Tasks on filter or page change
  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, categoryFilter, page]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/tasks', {
        params: {
          search: searchTerm || undefined,
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

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Delete "${taskTitle}"? This can't be undone.`)) return;
    try {
      await axiosClient.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const hasActiveFilters = search || statusFilter || categoryFilter;

  // Helper function to resolve category name for a given task
  const getCategoryName = (task) => {
    if (task.Category?.name) return task.Category.name;
    if (task.category?.name) return task.category.name;

    const catId = task.categoryId || task.category_id;
    if (catId) {
      const found = categories.find((c) => String(c.id) === String(catId));
      if (found) return found.name;
    }
    return null;
  };

  // Small helper so status badges are readable and consistent everywhere
  const statusStyles = {
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <div className="min-h-screen bg-[#F4F9F1] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track your everyday items</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/categories/new"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-xs px-4 py-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00B14F]"
            >
              + New Category
            </Link>
            <Link
              to="/tasks/new"
              className="bg-[#00B14F] hover:bg-[#009643] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00B14F]"
            >
              + New Task
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label htmlFor="task-search" className="block text-xs font-medium text-gray-500 mb-1">
                Search
              </label>
              <input
                id="task-search"
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus:border-[#00B14F]"
              />
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus:border-[#00B14F]"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="category-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F] focus:border-[#00B14F]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2 px-2 py-2 self-end md:self-center"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="grid gap-3" aria-busy="true" aria-label="Loading tasks">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-3.5 w-1/3 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-700 font-semibold text-sm mb-1">
              {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
            </p>
            <p className="text-gray-400 text-xs mb-4">
              {hasActiveFilters ? 'Try clearing a filter or searching something else.' : 'Create your first task to get started.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-[#00B14F] hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/tasks/new"
                className="inline-block bg-[#00B14F] hover:bg-[#009643] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm transition"
              >
                + New Task
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => {
              const categoryName = getCategoryName(task);

              return (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-sm truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>

                      {categoryName && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {categoryName}
                        </span>
                      )}

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyles[task.status] || statusStyles.pending}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-500 mb-1 line-clamp-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <span className="text-[10px] text-gray-400">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`status-${task.id}`} className="sr-only">
                      Change status for {task.title}
                    </label>
                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border border-gray-200 bg-[#F9FAFB] rounded-lg p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F]"
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
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      aria-label={`Delete task: ${task.title}`}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
              className="text-xs px-4 py-2 bg-white rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F]"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs px-4 py-2 bg-white rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B14F]"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}