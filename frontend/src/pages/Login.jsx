import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(loginId, password);
      // Redirect based on role
      if (loggedInUser.role === 'Admin' || loggedInUser.role === 'HR') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
<div className="min-h-screen bg-gradient-to-br from-white  flex items-center justify-center p-4 relative overflow-hidden">
  {/* Background radial gradient glow */}
  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full  blur-[120px] pointer-events-none" />

  <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-purple-100 rounded-3xl p-8 shadow-2xl relative">
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-100 text-[#614058] border border-purple-200 mb-4">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">
        HR Portal Login
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Sign in with your generated Login ID
      </p>
    </div>

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        {error}
      </div>
    )}

    <form onSubmit={handleLoginSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Login ID
        </label>

        <input
          type="text"
          required
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="e.g. ADMI20260001"
          className="w-full rounded-xl bg-white border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Password
        </label>

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl bg-white border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C8194] focus:border-[#9C8194] transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center rounded-xl bg-[#714B68] hover:bg-[#9C8194] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2"
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  </div>
</div>


  );
}


export default Login;