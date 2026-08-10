import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../axiosClient';

// Status is shown as a colored dot + label instead of a filled pill —
// quieter, and it scans faster down a column.
const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-amber-500' },
  in_progress: { label: 'In progress', dot: 'bg-blue-500' },
  completed: { label: 'Completed', dot: 'bg-[#00B14F]' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [search, setSearch] = useState('');        // what the user is typing
  const [searchTerm, setSearchTerm] = useState(''); // debounced value sent to the API
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/categories')
      .then((res) => setCategories(res.data.categories || res.data || []))
      .catch((err) => console.log('Could not load categories', err));
  }, []);

  // Wait 400ms after typing stops before it counts as a real search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

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
          limit: 8,
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

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-4 py-8 md:px-10">
      <div className="max-w-5xl mx-auto">

        {/* Header — bigger contrast between title and meta info, thin rule to ground it */}
        <div className="flex flex-wrap justify-between items-end gap-4 pb-5 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total > 0 ? `${pagination.total} total` : 'Manage and track your everyday items'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/categories/new"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
            >
              New category
            </Link>
            <Link
              to="/tasks/new"
              className="bg-[#00B14F] hover:bg-[#009643] text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00B14F]"
            >
              + New task
            </Link>
          </div>
        </div>

        {/* Toolbar — borderless, underline-style search instead of a boxed card */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <label htmlFor="task-search" className="sr-only">Search tasks</label>
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pb-2 bg-transparent border-b border-gray-300 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#00B14F] transition"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 flex items-center gap-1.5">
              <span className="text-gray-400">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label className="text-sm text-gray-600 flex items-center gap-1.5">
              <span className="text-gray-400">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-400 hover:text-gray-700 underline underline-offset-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-[11px] uppercase tracking-wide text-gray-400 px-5 py-3">Task</th>
                  <th className="text-left font-semibold text-[11px] uppercase tracking-wide text-gray-400 px-5 py-3">Category</th>
                  <th className="text-left font-semibold text-[11px] uppercase tracking-wide text-gray-400 px-5 py-3">Status</th>
                  <th className="text-left font-semibold text-[11px] uppercase tracking-wide text-gray-400 px-5 py-3">Due</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-5 py-4" colSpan={5}>
                        <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <p className="text-gray-700 font-semibold text-sm mb-1">
                        {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
                      </p>
                      <p className="text-gray-400 text-xs mb-4">
                        {hasActiveFilters ? 'Try clearing a filter or searching something else.' : 'Create your first task to get started.'}
                      </p>
                      {hasActiveFilters ? (
                        <button onClick={clearFilters} className="text-xs font-semibold text-[#00B14F] hover:underline">
                          Clear filters
                        </button>
                      ) : (
                        <Link to="/tasks/new" className="inline-block bg-[#00B14F] hover:bg-[#009643] text-white font-semibold text-xs px-4 py-2 rounded-lg transition">
                          + New task
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const categoryName = getCategoryName(task);
                    const status = STATUS_META[task.status] || STATUS_META.pending;

                    return (
                      <tr key={task.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition group">
                        <td className="px-5 py-4 max-w-xs">
                          <div className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-gray-400 truncate mt-0.5">{task.description}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {categoryName || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <span className="sr-only">Change status for {task.title}</span>
                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="bg-transparent text-gray-700 text-sm focus:outline-none cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </label>
                        </td>
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                            <Link
                              to={`/tasks/${task.id}`}
                              className="text-xs font-medium text-gray-500 hover:text-[#00B14F] transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              aria-label={`Delete task: ${task.title}`}
                              className="text-xs font-medium text-gray-400 hover:text-red-500 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}