import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchItemsByCategory } from '../services/firebaseOperations';
import MenuItem from './MenuItem';
import { FaArrowLeft } from 'react-icons/fa';

const CategoryItems = () => {
    const { categoryName } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadItems = async () => {
            try {
                const categoryItems = await fetchItemsByCategory(decodeURIComponent(categoryName));
                setItems(categoryItems);
            } catch (error) {
                console.error('Error loading category items:', error);
            } finally {
                setLoading(false);
            }
        };
        loadItems();
    }, [categoryName]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button 
                    onClick={handleBack}
                    className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                    <FaArrowLeft />
                </button>
                <h2 className="text-2xl font-bold">{decodeURIComponent(categoryName)} Items</h2>
            </div>
            {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600">No items found in this category.</p>
            )}
        </div>
    );
};

export default CategoryItems;