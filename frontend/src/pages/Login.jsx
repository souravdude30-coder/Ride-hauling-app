import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-600">
        Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
      </div>
    </div>
  );
};

export default Login;
