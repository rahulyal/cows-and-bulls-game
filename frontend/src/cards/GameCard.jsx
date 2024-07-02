// src/cards/GameCard.jsx
import React, { useState } from 'react';
import GameBoard from '../components/GameBoard';
import { startNewGamePublic, makeGuessPublic, updateStats } from '../services/api';

const MAX_GUESSES = 10;

const GameCard = () => {
    const [gameState, setGameState] = useState({
        gameId: null,
        secretNumber: null,
        currentGuess: ['', '', '', ''],
        guessHistory: [],
        isGameOver: false,
        isLoading: false,
        error: null,
        showRules: false,
        gameStarted: false
    });

    const startNewGameHandler = async () => {
        setGameState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const { gameId, secretNumber } = await startNewGamePublic();
            setGameState({
                gameId,
                secretNumber,
                currentGuess: ['', '', '', ''],
                guessHistory: [],
                isGameOver: false,
                isLoading: false,
                error: null,
                showRules: false,
                gameStarted: true
            });
        } catch (error) {
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to start a new game. Please try again.'
            }));
        }
    };

    const handleGuessSubmit = async () => {
        const guess = gameState.currentGuess.join('');
        if (guess.length !== 4) return;

        setGameState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await makeGuessPublic(gameState.gameId, gameState.secretNumber, guess);
            const newHistory = [{ guess, ...result }, ...gameState.guessHistory];
            const isGameOver = result.bulls === 4 || newHistory.length === MAX_GUESSES;

            setGameState(prev => ({
                ...prev,
                guessHistory: newHistory,
                currentGuess: ['', '', '', ''],
                isGameOver,
                isLoading: false
            }));

            if (isGameOver) {
                await updateStats(result.bulls === 4, newHistory.length);
            }
        } catch (error) {
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to submit guess. Please try again.'
            }));
        }
    };

    const toggleRules = () => {
        setGameState(prev => ({ ...prev, showRules: !prev.showRules }));
    };

    if (gameState.isLoading) {
        return <div className="text-center p-4 font-bold">Loading...</div>;
    }

    if (gameState.error) {
        return <div className="text-center text-red-500 p-4 font-bold">Error: {gameState.error}</div>;
    }

    return (
        <div className="bg-white border rounded-lg p-6 mb-4 max-w-md mx-auto">

            <div className="space-y-4">
                {!gameState.gameStarted ? (
                    <button
                        onClick={startNewGameHandler}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                    >
                        Play Game
                    </button>
                ) : (
                    <>
                        {gameState.isGameOver && (
                            <div className="mb-4 text-center font-bold text-2xl text-purple-600">
                                {gameState.guessHistory[0]?.bulls === 4 ? "You Win!" : "You Lose!"}
                            </div>
                        )}
                        <div className="mb-4 text-center font-semibold text-gray-700">
                            A secret number has been generated<br />
                            Guesses remaining: {MAX_GUESSES - gameState.guessHistory.length}
                        </div>
                        <GameBoard
                            currentGuess={gameState.currentGuess}
                            setCurrentGuess={(newGuess) => setGameState(prev => ({ ...prev, currentGuess: newGuess }))}
                            guessHistory={gameState.guessHistory}
                            onGuessSubmit={handleGuessSubmit}
                            isGameOver={gameState.isGameOver}
                        />
                        <button
                            onClick={startNewGameHandler}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                        >
                            New Game
                        </button>
                    </>
                )}

                <button
                    onClick={toggleRules}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition duration-300"
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
        </div>
    );
};

export default GameCard;