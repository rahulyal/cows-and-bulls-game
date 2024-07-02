// src/components/RegisterCard.js
import React, { useState } from 'react';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = ({ onSwitchToLogin, onBack }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        try {
            const data = await register(username, password);
            login(data);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Register</h2>
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-black transition-colors duration-200"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full p-2 border rounded"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full p-2 border rounded"
                />
                <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">Register</button>
            </form>
            <p className="mt-4 text-center">
                Already have an account?
                <button
                    className="ml-2 text-blue-500"
                    onClick={onSwitchToLogin}
                >
                    Login
                </button>
            </p>
        </div>
    );
};

export default Register;