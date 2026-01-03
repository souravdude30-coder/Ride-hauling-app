import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import safeParseJson from '../utils/safeParseJson';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data?.message || data?.detail || `Register failed (${res.status})`);
      }
      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm text-gray-700">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;
