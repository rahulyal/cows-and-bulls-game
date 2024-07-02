import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MultActiveGamesCard from '../cards/MultActiveGamesCard';
import MultStatsCard from '../cards/MultStatsCard';
import MultGameActionsCard from '../cards/MultGameActionsCard';

const MultPage = () => {
    const { logout } = useAuth();

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Cows and Bulls</h1>
                <div className="space-x-4">
                    <Link
                        to="/dashboard"
                        className="border border-black text-black font-bold py-2 px-4 rounded hover:bg-black hover:text-white transition duration-300"
                    >
                        Singleplayer
                    </Link>
                    <button
                        onClick={logout}
                        className="border border-red-500 text-red-500 font-bold py-2 px-4 rounded hover:bg-red-500 hover:text-white transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-3/5 px-2 mb-4">
                    <MultActiveGamesCard />
                </div>
                <div className="w-full md:w-2/5 px-2">
                    <MultGameActionsCard />
                    <br />
                    <MultStatsCard />
                </div>
            </div>
        </div>
    );
};

export default MultPage;