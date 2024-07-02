import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../services/api';

const MultGameActionsCard = () => {
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateGame = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { gameId, inviteCode } = await createGame();
            alert(`Game created! Invite code: ${inviteCode}`);
            navigate(`/dashboard/multiplayer/game/${gameId}/${inviteCode}`);
        } catch (error) {
            setError('Failed to create game');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinGame = async () => {
        if (!inviteCode.trim()) {
            setError('Please enter an invite code');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const { gameId } = await joinGame(inviteCode);
            navigate(`/dashboard/multiplayer/game/${gameId}/${inviteCode}`);
        } catch (error) {
            // console.log(error.response.data.error);
            setError(error.response.data.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Game Actions</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ? 'Creating...' : 'Create New Game'}
            </button>
            <div>
                <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code"
                    className="w-full border p-2 mb-2 rounded"
                />
                <button
                    onClick={handleJoinGame}
                    disabled={isLoading}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    {isLoading ? 'Joining...' : 'Join Game'}
                </button>
            </div>
        </div>
    );
};

export default MultGameActionsCard;