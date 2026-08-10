import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

/* =========================================================================
   Constants
   ========================================================================= */

const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-amber-500' },
  in_progress: { label: 'In progress', dot: 'bg-blue-500' },
  completed: { label: 'Completed', dot: 'bg-[#00B14F]' },
};
const STATUS_ORDER = ['pending', 'in_progress', 'completed'];
const PAGE_SIZE = 8;

/* =========================================================================
   Icons
   ========================================================================= */

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function FilterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}
function KebabIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

/* =========================================================================
   Hooks
   ========================================================================= */

// Delays reflecting `value` until the user stops changing it for `delay`ms.
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Fires `handler` when a mousedown lands outside every ref in `refs`.
function useOutsideClick(refs, handler, active) {
  useEffect(() => {
    if (!active) return;
    const onMouseDown = (e) => {
      const refList = Array.isArray(refs) ? refs : [refs];
      const clickedInside = refList.some((r) => r.current && r.current.contains(e.target));
      if (!clickedInside) handler();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [refs, handler, active]);
}

// All category-fetching logic lives here, isolated from task logic.
function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    axiosClient.get('/categories')
      .then((res) => setCategories(res.data.categories || res.data || []))
      .catch((err) => console.log('Could not load categories', err));
  }, []);
  return categories;
}

// All task-fetching, filtering and pagination state lives here, isolated
// from rendering. Returns everything a Tasks page needs and nothing else.
function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const searchTerm = useDebouncedValue(search, 400);

  // Reset to page 1 whenever a filter (not the page itself) changes.
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, categoryFilter]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/tasks', {
        params: {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          category_id: categoryFilter || undefined,
          page,
          limit: PAGE_SIZE,
        },
      });
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateStatus = async (taskId, newStatus) => {
    try {
      await axiosClient.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status', err);
    }
  };

  const deleteTask = async (taskId, taskTitle) => {
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
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || statusFilter || categoryFilter);

  return {
    tasks, pagination, loading, error,
    search, setSearch,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    page, setPage,
    hasActiveFilters, clearFilters,
    updateStatus, deleteTask,
  };
}

/* =========================================================================
   Small presentational helpers
   ========================================================================= */

function StatusDot({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return <span className={`w-2 h-2 rounded-full ${meta.dot}`} />;
}

function getCategoryName(task, categories) {
  if (task.Category?.name) return task.Category.name;
  if (task.category?.name) return task.category.name;
  const catId = task.categoryId || task.category_id;
  if (catId) {
    const found = categories.find((c) => String(c.id) === String(catId));
    if (found) return found.name;
  }
  return null;
}

function groupByCategory(tasks, categories) {
  return tasks.reduce((groups, task) => {
    const name = getCategoryName(task, categories) || 'Uncategorized';
    (groups[name] = groups[name] || []).push(task);
    return groups;
  }, {});
}

/* =========================================================================
   Header
   ========================================================================= */

function TasksHeader({ total }) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 pb-5 mb-6 border-b border-gray-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight bg-[#F4F9F1]">Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total > 0 ? `${total} total` : 'Manage and track your everyday items'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/categories/new" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
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
  );
}

/* =========================================================================
   Toolbars (filter controls, shared "shape" but different layouts)
   ========================================================================= */

function StatusSelect({ value, onChange, className }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">All</option>
      <option value="pending">Pending</option>
      <option value="in_progress">In progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}

function CategorySelect({ value, onChange, categories, className }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">All</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  );
}

function DesktopToolbar({ filters, categories }) {
  const { search, setSearch, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, hasActiveFilters, clearFilters } = filters;

  return (
    <div className="hidden md:flex items-center gap-x-6 gap-y-3 mb-5 flex-wrap">
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
          <StatusSelect
            value={statusFilter}
            onChange={setStatusFilter}
            className="bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
          />
        </label>
        <label className="text-sm text-gray-600 flex items-center gap-1.5">
          <span className="text-gray-400">Category</span>
          <CategorySelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            categories={categories}
            className="bg-transparent text-sm text-gray-800 font-medium focus:outline-none cursor-pointer"
          />
        </label>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs font-medium text-gray-400 hover:text-gray-700 underline underline-offset-2">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function MobileFilterPanel({ filters, categories, onClose }) {
  const { statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, hasActiveFilters, clearFilters } = filters;

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg p-4 z-20">
      <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
      <StatusSelect
        value={statusFilter}
        onChange={setStatusFilter}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-800 mb-3 focus:outline-none"
      />

      <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
      <CategorySelect
        value={categoryFilter}
        onChange={setCategoryFilter}
        categories={categories}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-800 focus:outline-none"
      />

      {hasActiveFilters && (
        <button
          onClick={() => { clearFilters(); onClose(); }}
          className="mt-3 text-xs font-semibold text-[#00B14F]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function MobileToolbar({ filters, categories }) {
  const { search, setSearch, hasActiveFilters } = filters;
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  useOutsideClick(panelRef, () => setPanelOpen(false), panelOpen);

  return (
    <div className="md:hidden flex items-center gap-2 mb-5">
      <div className="relative flex-1">
        <label htmlFor="task-search-mobile" className="sr-only">Search tasks</label>
        <input
          id="task-search-mobile"
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 rounded-xl pl-4 pr-10 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 transition"
        />
        <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Filter tasks"
          aria-expanded={panelOpen}
          className={`relative w-11 h-11 flex items-center justify-center rounded-xl transition ${
            panelOpen ? 'bg-gray-200' : 'bg-gray-100 active:bg-gray-200'
          }`}
        >
          <FilterIcon className="w-4 h-4 text-gray-500" />
          {hasActiveFilters && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00B14F]" />}
        </button>

        {panelOpen && (
          <MobileFilterPanel filters={filters} categories={categories} onClose={() => setPanelOpen(false)} />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   Status / empty / loading
   ========================================================================= */

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
      {message}
    </div>
  );
}

function EmptyState({ hasActiveFilters, onClear }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-16 text-center">
      <p className="text-gray-700 font-semibold text-sm mb-1">
        {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
      </p>
      <p className="text-gray-400 text-xs mb-4">
        {hasActiveFilters ? 'Try clearing a filter or searching something else.' : 'Create your first task to get started.'}
      </p>
      {hasActiveFilters ? (
        <button onClick={onClear} className="text-xs font-semibold text-[#00B14F] hover:underline">
          Clear filters
        </button>
      ) : (
        <Link to="/tasks/new" className="inline-block bg-[#00B14F] hover:bg-[#009643] text-white font-semibold text-xs px-4 py-2 rounded-lg transition">
          + New task
        </Link>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-5 py-4">
          <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   Desktop table
   ========================================================================= */

function TaskTableRow({ task, categoryName, onStatusChange, onDelete }) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition group">
      <td className="px-5 py-4 max-w-xs">
        <div className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </div>
        {task.description && <div className="text-xs text-gray-400 truncate mt-0.5">{task.description}</div>}
      </td>
      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
        {categoryName || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="sr-only">Change status for {task.title}</span>
          <StatusDot status={task.status} />
          <StatusSelect
            value={task.status}
            onChange={(val) => onStatusChange(task.id, val)}
            className="bg-transparent text-gray-700 text-sm focus:outline-none cursor-pointer"
          />
        </label>
      </td>
      <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
      </td>
      <td className="px-5 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
          <Link to={`/tasks/${task.id}`} className="text-xs font-medium text-gray-500 hover:text-[#00B14F] transition">
            Edit
          </Link>
          <button
            onClick={() => onDelete(task.id, task.title)}
            aria-label={`Delete task: ${task.title}`}
            className="text-xs font-medium text-gray-400 hover:text-red-500 transition"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function DesktopTaskTable({ tasks, categories, onStatusChange, onDelete }) {
  return (
    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            {tasks.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                categoryName={getCategoryName(task, categories)}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   Mobile card list
   ========================================================================= */

function TaskActionMenu({ task, onStatusChange, onDelete, onClose, menuRef }) {
  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-3 top-12 w-44 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-20"
    >
      <Link to={`/tasks/${task.id}`} className="block px-3.5 py-2 text-sm text-gray-700 active:bg-gray-50">
        Edit
      </Link>

      <div className="px-3.5 pt-2 pb-1 text-[11px] font-medium text-gray-400">Mark as</div>
      {STATUS_ORDER.filter((s) => s !== task.status).map((s) => (
        <button
          key={s}
          onClick={() => { onStatusChange(task.id, s); onClose(); }}
          className="w-full text-left px-3.5 py-1.5 text-sm text-gray-700 active:bg-gray-50 flex items-center gap-2"
        >
          <StatusDot status={s} />
          {STATUS_META[s].label}
        </button>
      ))}

      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={() => { onDelete(task.id, task.title); onClose(); }}
        className="w-full text-left px-3.5 py-2 text-sm text-red-500 active:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}

function MobileTaskCard({ task, isMenuOpen, onOpenMenu, onCloseMenu, onStatusChange, onDelete }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const kebabRef = useRef(null);

  useOutsideClick([menuRef, kebabRef], onCloseMenu, isMenuOpen);

  return (
    <div
      className="relative bg-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-2 active:bg-gray-200/70 transition"
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="min-w-0">
        <div className={`font-semibold truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StatusDot status={task.status} />
          <span className="text-xs text-gray-400">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : STATUS_META[task.status]?.label}
          </span>
        </div>
      </div>

      <button
        ref={kebabRef}
        onClick={(e) => { e.stopPropagation(); isMenuOpen ? onCloseMenu() : onOpenMenu(); }}
        aria-label={`More actions for ${task.title}`}
        aria-expanded={isMenuOpen}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-300/60 active:text-gray-600 transition"
      >
        <KebabIcon className="w-4 h-4" />
      </button>

      {isMenuOpen && (
        <TaskActionMenu
          task={task}
          menuRef={menuRef}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onClose={onCloseMenu}
        />
      )}
    </div>
  );
}

function MobileTaskGroup({ groupName, tasks, openMenuId, onOpenMenu, onCloseMenu, onStatusChange, onDelete }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 mb-2 px-0.5">{groupName}</h2>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <MobileTaskCard
            key={task.id}
            task={task}
            isMenuOpen={openMenuId === task.id}
            onOpenMenu={() => onOpenMenu(task.id)}
            onCloseMenu={onCloseMenu}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function MobileTaskList({ tasks, categories, onStatusChange, onDelete }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const grouped = groupByCategory(tasks, categories);

  return (
    <div className="md:hidden flex flex-col gap-5">
      {Object.entries(grouped).map(([groupName, groupTasks]) => (
        <MobileTaskGroup
          key={groupName}
          groupName={groupName}
          tasks={groupTasks}
          openMenuId={openMenuId}
          onOpenMenu={setOpenMenuId}
          onCloseMenu={() => setOpenMenuId(null)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

/* =========================================================================
   Pagination
   ========================================================================= */

function PaginationControls({ pagination, page, setPage }) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center mt-5">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition"
      >
        ← Previous
      </button>
      <span className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
      <button
        disabled={page === pagination.totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition"
      >
        Next →
      </button>
    </div>
  );
}

/* =========================================================================
   Page
   ========================================================================= */

export default function Tasks() {
  const categories = useCategories();
  const taskState = useTasks();
  const {
    tasks, pagination, loading, error,
    page, setPage, hasActiveFilters, clearFilters,
    updateStatus, deleteTask,
  } = taskState;

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-4 py-8 md:px-10">
      <div className="max-w-5xl mx-auto">
        <TasksHeader total={pagination.total} />

        <DesktopToolbar filters={taskState} categories={categories} />
        <MobileToolbar filters={taskState} categories={categories} />

        <ErrorBanner message={error} />

        {!loading && tasks.length === 0 && (
          <EmptyState hasActiveFilters={hasActiveFilters} onClear={clearFilters} />
        )}

        {loading && <LoadingSkeleton />}

        {!loading && tasks.length > 0 && (
          <>
            <DesktopTaskTable
              tasks={tasks}
              categories={categories}
              onStatusChange={updateStatus}
              onDelete={deleteTask}
            />
            <MobileTaskList
              tasks={tasks}
              categories={categories}
              onStatusChange={updateStatus}
              onDelete={deleteTask}
            />
          </>
        )}

        <PaginationControls pagination={pagination} page={page} setPage={setPage} />
      </div>
    </div>
  );
}