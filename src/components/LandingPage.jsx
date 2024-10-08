import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaMedkit } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-[#004E89]">Welcome, {user.username}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/food-order" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                    <FaUtensils className="text-5xl text-[#FF6B35] mb-4" />
                    <h2 className="text-2xl font-semibold text-[#004E89]">Food Order</h2>
                    <p className="mt-2 text-gray-600">Order delicious meals from local restaurants.</p>
                </Link>
                <Link to="/medicare" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                    <FaMedkit className="text-5xl text-[#FF6B35] mb-4" />
                    <h2 className="text-2xl font-semibold text-[#004E89]">Medicare</h2>
                    <p className="mt-2 text-gray-600">Access healthcare services and information.</p>
                </Link>
                {/* Add more service cards as needed */}
            </div>
        </div>
    );
};

export default LandingPage;