import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserDetails } from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const details = await getUserDetails();
                setUserDetails(details);
            } catch (err) {
                setError('Failed to fetch user details');
                console.error(err);
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {userDetails && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">User Details:</h2>
                    <p>User ID: {userDetails.user_id}</p>
                    <p>Username: {userDetails.username}</p>
                    <p>Account Created: {new Date(userDetails.created_at).toLocaleString()}</p>
                    <p>Last Login: {new Date(userDetails.last_login).toLocaleString()}</p>
                </div>
            )}
            <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;