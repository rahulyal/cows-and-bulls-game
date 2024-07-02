// src/components/GuessInput.js
import React from 'react';

const GuessInput = ({ currentGuess, setCurrentGuess, onGuessSubmit, disabled }) => {
    const handleInputChange = (index, value) => {
        // Allow backspace to clear the input
        if (value === '') {
            const newGuess = [...currentGuess];
            newGuess[index] = value;
            setCurrentGuess(newGuess);
            return;
        }

        // Original validation for single digit and numeric value
        if (value.length > 1 || !/^\d*$/.test(value)) return;

        const newGuess = [...currentGuess];

        // Check if the new value already exists in the current guess
        if (newGuess.includes(value)) return;

        // Check if the first digit is '0'
        if (index === 0 && value === '0') return;

        newGuess[index] = value;
        setCurrentGuess(newGuess);

        // Automatically focus the next input if the current one is filled
        if (value && index < 3) {
            document.getElementById(`guess-input-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !currentGuess[index] && index > 0) {
            document.getElementById(`guess-input-${index - 1}`).focus();
        }
    };

    return (
        <div className="flex space-x-2 items-center">
            {currentGuess.map((digit, index) => (
                <input
                    key={index}
                    id={`guess-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-2xl border-2 border-gray-300 rounded"
                    maxLength="1"
                    disabled={disabled}
                />
            ))}
            <button
                onClick={onGuessSubmit}
                disabled={disabled || currentGuess.some(digit => digit === '')}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
                Guess
            </button>
        </div>
    );
};

export default GuessInput;