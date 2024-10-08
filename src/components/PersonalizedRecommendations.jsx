import React, { useState, useEffect } from 'react';
import { getPersonalizedRecommendations } from '../services/api';
import MenuItem from './MenuItem';
import { useAuth } from '../contexts/AuthContext';

const PersonalizedRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const { user, fetchPersonalizedRecommendations } = useAuth();

    useEffect(() => {
        const loadRecommendations = async () => {
            if (user) {
                const items = await fetchPersonalizedRecommendations();
                setRecommendations(items);
            }
        };
        loadRecommendations();
    }, [user, fetchPersonalizedRecommendations]);

    if (recommendations.length === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(item => (
                    <MenuItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default PersonalizedRecommendations;