// src/cards/StatsCard.jsx
import React, { useState, useEffect } from 'react';
import { getGlobalStats } from '../services/api';

const StatsCard = () => {
    const [globalStats, setGlobalStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGlobalStats();
    }, []);

    const fetchGlobalStats = async () => {
        try {
            setIsLoading(true);
            const stats = await getGlobalStats();
            // console.log(stats);
            setGlobalStats(stats);
        } catch (error) {
            console.error('Failed to fetch global stats:', error);
            setError('Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>Loading stats...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-white border rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Global Stats</h2>
            {globalStats && (
                <div>
                    <p>Total Games: {globalStats.totalgamesplayed}</p>
                    <p>Games Won: {globalStats.totalgameswon}</p>
                    <p>Average Moves: {globalStats.averagemovestowin}</p>
                </div>
            )}
        </div>
    );
};

export default StatsCard;