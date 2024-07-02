// src/components/MultiplayerGameBoard.jsx
import React from 'react';
import GuessInput from '../components/GuessInput';
import GuessRow from '../components/GuessRow';

const MultiplayerGameBoard = ({
    currentGuess,
    setCurrentGuess,
    guessHistory,
    onGuessSubmit,
    isPlayerTurn,
    isGameOver
}) => {
    return (
        <div className="space-y-4">
            {!isGameOver && (
                <GuessInput
                    currentGuess={currentGuess}
                    setCurrentGuess={setCurrentGuess}
                    onGuessSubmit={onGuessSubmit}
                    disabled={!isPlayerTurn}
                />
            )}
            <div className="space-y-2">
                {guessHistory ? (
                    guessHistory.map((guess, index) => (
                        <GuessRow key={index} guess={guess} isPastGuess={true} />
                    ))
                ) : (
                    <p>No guesses yet.</p>
                )}
            </div>
        </div>
    );
};

export default MultiplayerGameBoard;