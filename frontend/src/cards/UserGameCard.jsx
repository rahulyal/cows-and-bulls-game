import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import { getActiveGameUser, startNewGameUser, getGameStateUser, makeGuessUser } from '../services/api';

const MAX_GUESSES = 10;

const UserGameCard = () => {
    const [gameState, setGameState] = useState({
        gameId: null,
        secretNumber: null,
        currentGuess: ['', '', '', ''],
        guessHistory: [],
        isGameOver: false,
        isWin: false,
        isLoading: false,
        error: null,
        showRules: false,
        hasActiveGame: false,
        isPlaying: false,
        remainingGuesses: MAX_GUESSES
    });

    // Check for active game on component mount
    useEffect(() => {
        checkForActiveGame();
    }, []);

    const checkForActiveGame = async () => {
        setGameState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const activeGame = await getActiveGameUser();
            // console.log(activeGame);
            setGameState(prev => ({
                ...prev,
                hasActiveGame: !!activeGame,
                gameId: activeGame ? activeGame.game_id : null,
                isLoading: false
            }));
            // console.log('gamestate:', gameState);
        } catch (error) {
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to check for active games.'
            }));
        }
    };

    const handleStartNewGame = async () => {
        setGameState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const { gameId, secretNumber } = await startNewGameUser();
            setGameState(prev => ({
                ...prev,
                gameId,
                secretNumber,
                currentGuess: ['', '', '', ''],
                guessHistory: [],
                isGameOver: false,
                isWin: false,
                isLoading: false,
                isPlaying: true,
                remainingGuesses: MAX_GUESSES
            }));
        } catch (error) {
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to start a new game. Please try again.'
            }));
        }
    };

    const handleContinueGame = async () => {
        setGameState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const gameData = await getGameStateUser(gameState.gameId);
            setGameState(prev => ({
                ...prev,
                secretNumber: gameData.secret_number,
                guessHistory: gameData.moves,
                isGameOver: gameData.status === 'completed',
                isWin: gameData.winner_id !== null,
                isLoading: false,
                isPlaying: true,
                remainingGuesses: MAX_GUESSES - gameData.moves.length
            }));
        } catch (error) {
            console.log('Failed to continue game:', error);
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to continue the game. Please try again.'
            }));
        }
    };

    const handleGuessSubmit = async () => {
        const guess = gameState.currentGuess.join('');
        if (guess.length !== 4) return;

        setGameState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await makeGuessUser(gameState.gameId, guess);
            const newHistory = [{ guess, ...result }, ...gameState.guessHistory];
            const isGameOver = result.isGameOver;
            const isWin = result.isWin;

            setGameState(prev => ({
                ...prev,
                guessHistory: newHistory,
                currentGuess: ['', '', '', ''],
                isGameOver,
                isWin,
                isLoading: false,
                remainingGuesses: prev.remainingGuesses - 1
            }));
        } catch (error) {
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to submit guess. Please try again.'
            }));
        }
    };

    const handleGoHome = () => {
        setGameState(prev => ({
            ...prev,
            isPlaying: false,
            currentGuess: ['', '', '', '']
        }));
        checkForActiveGame();
    };

    const toggleRules = () => {
        setGameState(prev => ({ ...prev, showRules: !prev.showRules }));
    };

    if (gameState.isLoading) {
        return <div className="text-center p-4 font-bold">Loading...</div>;
    }

    return (
        <div className="bg-white border rounded-lg p-6 mb-4 max-w-md mx-auto">
            <div className="space-y-4">
                {!gameState.isPlaying ? (
                    <>
                        <button
                            onClick={handleStartNewGame}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                        >
                            Play Game
                        </button>
                        {gameState.hasActiveGame && (
                            <button
                                onClick={handleContinueGame}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                            >
                                Continue Game
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {gameState.isGameOver ? (
                            <div className="mb-4 text-center font-bold text-2xl text-purple-600">
                                {gameState.isWin ? "You Win!" : "You Lose!"}
                            </div>
                        ) : (
                            <div className="mb-4 text-center font-semibold text-gray-700">
                                Guesses remaining: {gameState.remainingGuesses}
                            </div>
                        )}
                        <GameBoard
                            currentGuess={gameState.currentGuess}
                            setCurrentGuess={(newGuess) => setGameState(prev => ({ ...prev, currentGuess: newGuess }))}
                            guessHistory={gameState.guessHistory}
                            onGuessSubmit={handleGuessSubmit}
                            isGameOver={gameState.isGameOver}
                        />
                        {gameState.isGameOver && (
                            <button
                                onClick={handleGoHome}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                            >
                                Go Back Home
                            </button>
                        )}
                        {!gameState.isGameOver && (
                            <button
                                onClick={handleStartNewGame}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                            >
                                Restart Game
                            </button>
                        )}
                    </>
                )}

                <button
                    onClick={toggleRules}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                >
                    {gameState.showRules ? 'Hide Rules' : 'How to Play'}
                </button>
            </div>

            {gameState.showRules && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner">
                    <h3 className="font-bold text-lg mb-2 text-blue-600">How to Play:</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Guess the 4-digit secret number.</li>
                        <li>Each digit is used only once.</li>
                        <li>Bulls: Correct digit in correct position.</li>
                        <li>Cows: Correct digit in wrong position.</li>
                        <li>You have {MAX_GUESSES} attempts to guess the number.</li>
                    </ul>
                </div>
            )}

            {gameState.error && (
                <div className="mt-4 text-center text-red-500 font-bold">
                    {gameState.error}
                </div>
            )}
        </div>
    );
};

export default UserGameCard;