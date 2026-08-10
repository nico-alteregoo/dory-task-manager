import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../context/ContextProvider';

export default function Auth() {
  const navigate = useNavigate();
  
  // 1. Destructure setToken and setUser from context
  const { setToken, setUser } = useStateContext();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN REQUEST
        const response = await axiosClient.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        // 2. Set token and user in global state & localStorage
        setToken(response.data.token);
        setUser(response.data.user);

        // 3. Navigate cleanly using React Router instead of window.location.href
        navigate('/tasks');
      } else {
        // REGISTER REQUEST
        const response = await axiosClient.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setSuccess(response.data.message || 'Account created! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      const response = err.response;
      if (response && response.data?.message) {
        setError(response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9F1] flex flex-col justify-center items-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#00B14F] tracking-tight">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isLogin ? 'Log in to continue' : 'Sign up to get started'}
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        
        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 text-[#00B14F] text-xs border border-green-100 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#00B14F] transition"
              required
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#00B14F] hover:bg-[#009643] text-white font-semibold rounded-full shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-[#00B14F] font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}