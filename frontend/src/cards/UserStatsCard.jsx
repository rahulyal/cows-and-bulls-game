import React, { useState, useEffect } from 'react';
import { getUserStats } from '../services/api';

const UserStatsCard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching user stats...');
            const data = await getUserStats();
            console.log('Received user stats:', data);
            setStats(data);
        } catch (err) {
            console.error('Error fetching user stats:', err);
            setError('Failed to fetch user stats');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>Loading stats...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!stats) return null;

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Your Game Stats</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold">Total Games:</p>
                    <p>{stats.total_games}</p>
                </div>
                <div>
                    <p className="font-semibold">Games Won:</p>
                    <p>{stats.games_won}</p>
                </div>
                <div>
                    <p className="font-semibold">Games Lost:</p>
                    <p>{stats.games_lost}</p>
                </div>
                <div>
                    <p className="font-semibold">Win Percentage:</p>
                    <p>{stats.win_percentage}%</p>
                </div>
                <div>
                    <p className="font-semibold">Avg Moves per Game:</p>
                    <p>{stats.avg_moves}</p>
                </div>
                <div>
                    <p className="font-semibold">Best Game (Moves):</p>
                    <p>{stats.best_game || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default UserStatsCard;   