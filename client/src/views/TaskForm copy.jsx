import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../context/ContextProvider';

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setNotification } = useStateContext();

  const [task, setTask] = useState({
    id: null,
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  // Fetch existing task details if in Edit mode (id exists)
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/tasks/${id}`)
        .then(({ data }) => {
          setLoading(false);
          // Standardize date format for <input type="date"> (YYYY-MM-DD)
          const formattedTask = {
            ...data.task,
            dueDate: data.task?.dueDate ? data.task.dueDate.split('T')[0] : '',
          };
          setTask(formattedTask);
        })
        .catch((err) => {
          setLoading(false);
          console.error('Error fetching task:', err);
        });
    }
  }, [id]);

  const onSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    if (id) {
      // UPDATE existing task
      axiosClient
        .put(`/tasks/${id}`, task)
        .then(() => {
          setLoading(false);
          if (setNotification) setNotification('Task successfully updated');
          navigate('/tasks');
        })
        .catch((error) => {
          setLoading(false);
          const response = error.response;
          if (response && (response.status === 422 || response.status === 400)) {
            setErrors(response.data.errors || { message: [response.data.message] });
          } else {
            setErrors({ message: ['An unexpected error occurred.'] });
          }
        });
    } else {
      // CREATE new task
      axiosClient
        .post('/tasks', task)
        .then(() => {
          setLoading(false);
          if (setNotification) setNotification('Task successfully created');
          navigate('/tasks');
        })
        .catch((error) => {
          setLoading(false);
          const response = error.response;
          if (response && (response.status === 422 || response.status === 400)) {
            setErrors(response.data.errors || { message: [response.data.message] });
          } else {
            setErrors({ message: ['An unexpected error occurred.'] });
          }
        });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? `Edit Task: ${task.title}` : 'Create New Task'}
        </h1>
        <Link
          to="/tasks"
          className="text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-xl"
        >
          ← Back to Tasks
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {loading && (
          <div className="text-center py-8 text-sm font-semibold text-[#00B14F]">
            Loading task details...
          </div>
        )}

        {/* Validation Errors */}
        {errors && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
            {typeof errors === 'object' && !Array.isArray(errors) ? (
              Object.keys(errors).map((key) => (
                <p key={key}>
                  {Array.isArray(errors[key]) ? errors[key][0] : errors[key]}
                </p>
              ))
            ) : (
              <p>An error occurred. Please check your inputs.</p>
            )}
          </div>
        )}

        {!loading && (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                placeholder="Enter task title"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Description
              </label>
              <textarea
                rows="4"
                value={task.description || ''}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                placeholder="Task description (optional)"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
              />
            </div>

            {/* Status & Due Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => setTask({ ...task, status: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-[#00B14F] hover:bg-[#009643] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition active:scale-[0.98]"
            >
              Save Task
            </button>
          </form>
        )}
      </div>
    </div>
  );
}