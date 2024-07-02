import React, { useState } from 'react';
import GameCard from '../cards/GameCard';
import AuthCard from '../cards/AuthCard';
import StatsCard from '../cards/StatsCard';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold text-left mb-8">Cows and Bulls</h1>
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-3/5 px-2 mb-4">
                    <GameCard />
                </div>
                <div className="w-full md:w-2/5 px-2">
                    {!user && <AuthCard />}
                    <StatsCard />
                </div>
            </div>
        </div>
    );
};

export default HomePage;