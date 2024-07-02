import React from 'react';
import GuessResult from './GuessResult';

const GuessRow = ({ guess, isPastGuess }) => {
    return (
        <div className="flex space-x-2 items-center">
            {guess.guess.split('').map((digit, index) => (
                <div key={index} className="w-12 h-12 flex items-center justify-center text-2xl border-2 border-gray-300 rounded">
                    {digit}
                </div>
            ))}
            {isPastGuess && <GuessResult bulls={guess.bulls} cows={guess.cows} />}
        </div>
    );
};

export default GuessRow;