import React, { useState, useEffect } from 'react';
import { getStats } from '../services/api';

const MultStatsCard = () => {
    const [stats, setStats] = useState({ wins: 0, losses: 0, ties: 0 });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const userStats = await getStats();
            setStats(userStats);
        } catch (error) {
            setError('Failed to fetch stats');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>Loading stats...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="font-bold text-lg">{stats.wins}</p>
                    <p>Wins</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{stats.losses}</p>
                    <p>Losses</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{stats.ties}</p>
                    <p>Ties</p>
                </div>
            </div>
        </div>
    );
};

export default MultStatsCard;