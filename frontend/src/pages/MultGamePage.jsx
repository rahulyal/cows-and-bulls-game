import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
// import { getGameDetails } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MultMainGameCard from '../cards/MultMainGameCard';
import MultOppGameCard from '../cards/MultOppGameCard';
// import MultiplayerGameBoard from '../cards/MultGameCard';
// import SecretInput from '../components/SecretInput';

const API_URL = import.meta.env.VITE_API_URL;

const MultGamePage = () => {
    const { user } = useAuth();
    const { gameId, inviteCode } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [secretNumber, setSecretNumber] = useState(['', '', '', '']);
    const [currentGuess, setCurrentGuess] = useState(['', '', '', '']);
    const [gameState, setGameState] = useState({
        player1: { id: '', name: '', secretSet: false, moves: [] },
        player2: { id: '', name: '', secretSet: false, moves: [] },
        currentTurn: '',
        status: 'waiting',
        error: null,
        isLoading: true
    });

    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            newSocket.emit('joinGame', { gameId, inviteCode });
        });

        newSocket.on('gameUpdated', (updatedGame) => {
            console.log('Game updated:', updatedGame);
            setGameState(prevState => ({
                ...prevState,
                ...updatedGame,
                isLoading: false
            }));
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
            setGameState(prevState => ({
                ...prevState,
                error: error.message,
                isLoading: false
            }));
        });

        return () => newSocket.disconnect();
    }, [gameId, inviteCode]);

    const handleSetSecret = () => {
        const secret = secretNumber.join('');
        if (secret.length !== 4 || !/^\d+$/.test(secret)) {
            alert('Secret number must be 4 digits');
            return;
        }
        socket.emit('setSecret', { gameId, userId: user.id, secret });
    };

    const handleGuessSubmit = () => {
        const guess = currentGuess.join('');
        if (guess.length !== 4 || !/^\d+$/.test(guess)) {
            alert('Guess must be 4 digits');
            return;
        }
        socket.emit('makeGuess', { gameId, userId: user.id, guess });
        setCurrentGuess(['', '', '', '']);
    };

    const handleBackClick = () => {
        navigate('/dashboard/multiplayer');
    };

    if (gameState.isLoading) return <div className="text-center p-4">Loading...</div>;
    if (gameState.error) return <div className="text-center p-4 text-red-500">Error: {gameState.error}</div>;

    const currentPlayer = gameState.player1.id === user.id ? gameState.player1 : gameState.player2;
    const opponent = gameState.player1.id === user.id ? gameState.player2 : gameState.player1;
    const isPlayerTurn = gameState.currentTurn === user.id;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Cows and Bulls</h1>
                <div className="flex items-center">
                    <button
                        onClick={handleBackClick}
                        className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                        Back
                    </button>
                    <span className={`font-bold ${gameState.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {gameState.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-3/5">
                    <MultMainGameCard
                        currentPlayer={currentPlayer}
                        opponent={opponent}
                        isPlayerTurn={isPlayerTurn}
                        gameStatus={gameState.status}
                        secretNumber={secretNumber}
                        setSecretNumber={setSecretNumber}
                        handleSetSecret={handleSetSecret}
                        currentGuess={currentGuess}
                        setCurrentGuess={setCurrentGuess}
                        handleGuessSubmit={handleGuessSubmit}
                        winner={gameState.winner}
                    />
                </div>
                <div className="md:w-2/5">
                    <MultOppGameCard
                        opponent={opponent}
                        isPlayerTurn={isPlayerTurn}
                        gameStatus={gameState.status}
                    />
                </div>
            </div>
        </div>
    );
};

export default MultGamePage;