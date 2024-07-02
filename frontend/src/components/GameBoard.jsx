// src/components/GameBoard.js
import React from 'react';
import GuessRow from './GuessRow';
import GuessInput from './GuessInput';

const GameBoard = ({ currentGuess, setCurrentGuess, guessHistory, onGuessSubmit, isGameOver }) => {
    // console.log(guessHistory);
    return (
        <div className="space-y-2">
            <GuessInput
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
                onGuessSubmit={onGuessSubmit}
                disabled={isGameOver}
            />
            {guessHistory.map((guess, index) => (
                <GuessRow key={index} guess={guess} isPastGuess={true} />
            ))}
        </div>
    );
};

export default GameBoard;