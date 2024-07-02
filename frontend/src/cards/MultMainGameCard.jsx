// src/components/MultMainGameCard.jsx
import React from 'react';
import MultiplayerGameBoard from './MultGameCard';
import SecretInput from '../components/SecretInput';

const MultMainGameCard = ({
    currentPlayer,
    opponent,
    isPlayerTurn,
    gameStatus,
    secretNumber,
    setSecretNumber,
    handleSetSecret,
    currentGuess,
    setCurrentGuess,
    handleGuessSubmit,
    winner
}) => {
    const renderGameEndMessage = () => {
        if (gameStatus !== 'completed') return null;

        if (winner === null) {
            return <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">The game ended in a tie!</div>;
        } else if (winner === currentPlayer.id) {
            return <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">Congratulations! You won the game!</div>;
        } else {
            return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{opponent.name} won the game. Better luck next time!</div>;
        }
    };

    return (
        <div className="bg-white border rounded-lg p-6 relative h-full">
            <h2 className="text-2xl font-bold mb-4">Your Board</h2>
            {isPlayerTurn && gameStatus === 'active' && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                    Your Turn
                </div>
            )}
            {!isPlayerTurn && gameStatus === 'active' && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                    Opponent Turn
                </div>
            )}
            {renderGameEndMessage()}
            {!currentPlayer.secretSet ? (
                <div className="mb-4">
                    <p className="mb-2">Set your secret number:</p>
                    <SecretInput
                        secretNumber={secretNumber}
                        setSecretNumber={setSecretNumber}
                        onSecretSubmit={handleSetSecret}
                    />
                </div>
            ) : (
                <MultiplayerGameBoard
                    currentGuess={currentGuess}
                    setCurrentGuess={setCurrentGuess}
                    guessHistory={currentPlayer.moves}
                    onGuessSubmit={handleGuessSubmit}
                    isPlayerTurn={isPlayerTurn}
                    isGameOver={gameStatus === 'completed'}
                />
            )}
        </div>
    );
};

export default MultMainGameCard;