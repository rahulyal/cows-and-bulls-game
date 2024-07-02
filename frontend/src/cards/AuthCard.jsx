// src/components/AuthCard.js
import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthCard = () => {
    const [authMode, setAuthMode] = useState(null); // null, 'login', or 'register'

    const renderAuthOptions = () => (
        <div className="bg-white border rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <div className="space-y-4">
                <button
                    onClick={() => setAuthMode('login')}
                    className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                    Login
                </button>
                <button
                    onClick={() => setAuthMode('register')}
                    className="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                    Register
                </button>
            </div>
        </div>
    );

    const handleBackToOptions = () => {
        setAuthMode(null);
    };

    if (authMode === 'login') {
        return <Login onSwitchToRegister={() => setAuthMode('register')} onBack={handleBackToOptions} />;
    }

    if (authMode === 'register') {
        return <Register onSwitchToLogin={() => setAuthMode('login')} onBack={handleBackToOptions} />;
    }

    return renderAuthOptions();
};

export default AuthCard;