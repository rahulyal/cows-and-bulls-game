import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveGames, abandonGame } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MultActiveGamesCard = () => {
    const [activeGames, setActiveGames] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    // console.log(user);

    useEffect(() => {
        fetchActiveGames();
    }, []);

    const fetchActiveGames = async () => {
        setIsLoading(true);
        try {
            const games = await getActiveGames();
            setActiveGames(games);
        } catch (error) {
            setError('Failed to fetch active games');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAbandonGame = async (gameId) => {
        try {
            await abandonGame(gameId);
            await fetchActiveGames(); // Refresh the games list
        } catch (error) {
            console.error('Failed to abandon game:', error);
            setError('Failed to abandon game');
        }
    };

    if (isLoading) return <div>Loading active games...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    // console.log(activeGames);

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Your Games</h2>
            {activeGames.length === 0 ? (
                <p>No active or waiting games</p>
            ) : (
                <ul className="space-y-4">
                    {activeGames.map(game => (
                        <li key={game.game_id} className="border-b pb-2">
                            <p>Opponent: {game.player1_id === user.id ? game.player2_name : game.player1_name}</p>
                            <p>Status: {game.status}</p>
                            <Link
                                to={`/dashboard/multiplayer/game/${game.game_id}/${game.invite_code}`}
                                className={`mt-2 inline-block px-4 py-2 rounded ${game.is_player_turn
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-300 text-gray-700"
                                    }`}
                            >
                                {game.is_player_turn ? "Make Move" : "Observe"}
                            </Link>
                            <GameAbandonOption gameId={game.game_id} onAbandon={handleAbandonGame} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const GameAbandonOption = ({ gameId, onAbandon }) => {
    const [showAbandonOption, setShowAbandonOption] = useState(false);

    return (
        <div className="mt-2">
            <p
                className="text-sm text-gray-600 cursor-pointer hover:underline"
                onClick={() => setShowAbandonOption(!showAbandonOption)}
            >
                Having trouble playing this game? Click here to see options.
            </p>
            {showAbandonOption && (
                <button
                    onClick={() => onAbandon(gameId)}
                    className="mt-1 text-red-500 hover:text-red-700 text-sm"
                >
                    Abandon this game
                </button>
            )}
        </div>
    );
};

export default MultActiveGamesCard;