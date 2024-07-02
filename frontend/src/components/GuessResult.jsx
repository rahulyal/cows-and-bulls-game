// src/components/GuessResult.js
import React from 'react';

const GuessResult = ({ bulls, cows }) => {
    return (
        <div className="ml-4 text-sm">
            <span className="mr-2">🦬 {bulls}</span>
            <span>🐮 {cows}</span>
        </div>
    );
};

export default GuessResult;