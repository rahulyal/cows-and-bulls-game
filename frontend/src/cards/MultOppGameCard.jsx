// src/components/MultOppGameCard.jsx
import React from 'react';
import GuessRow from '../components/GuessRow';

const MultOppGameCard = ({ opponent, isPlayerTurn, gameStatus }) => {
    return (
        <div className="bg-white border rounded-lg p-6 relative h-full">
            <h2 className="text-2xl font-bold mb-4">Opponent's Board</h2>
            <p className="mb-4">{opponent.name || "Waiting for opponent"}</p>
            <div className="space-y-2">
                {opponent.moves && opponent.moves.length > 0 ? (
                    opponent.moves.map((move, index) => (
                        <GuessRow key={index} guess={move} isPastGuess={true} />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No moves yet</p>
                )}
            </div>
        </div>
    );
};

export default MultOppGameCard;