import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import PersonalizedRecommendations from './PersonalizedRecommendations';
import { fetchPopularItemsWithHotelInfo, fetchLastOrder } from '../services/firebaseOperations';
import { FaFilter, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PopularItems = ({ userLocation }) => {
    const [popularItems, setPopularItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [lastOrderItem, setLastOrderItem] = useState(null);
    const { currentUser } = useAuth();
    const [filters, setFilters] = useState({
        veg: false,
        priceRange: 1000,
        rating: 0
    });

    useEffect(() => {
        const loadPopularItems = async () => {
            if (userLocation?.latitude && userLocation?.longitude) {
                try {
                    const items = await fetchPopularItemsWithHotelInfo(userLocation);
                    setPopularItems(items);
                    setFilteredItems(items);
                    if (currentUser) {
                        const lastOrder = await fetchLastOrder(currentUser.uid);
                        if (lastOrder) {
                            setLastOrderItem(lastOrder.itemId);
                        }
                    }
                } catch (error) {
                    console.error('Error loading popular items:', error);
                }
            }
        };
        loadPopularItems();
    }, [userLocation, currentUser]);

    useEffect(() => {
        const filtered = popularItems.filter(item => 
            (!filters.veg || item.isVeg) &&
            item.productPrice <= filters.priceRange &&
            item.productRating >= filters.rating
        );
        setFilteredItems(filtered);
    }, [filters, popularItems]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <PersonalizedRecommendations />
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Popular Items</h2>
                <Link to="/all-menu" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                    All Menu
                </Link>
            </div>
            
            <div className="mb-6 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <FaFilter className="mr-2 text-blue-500" /> Filters
                </h3>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={filters.veg}
                            onChange={(e) => handleFilterChange('veg', e.target.checked)}
                            className="mr-2"
                        />
                        Vegetarian Only
                    </label>
                    <div className="flex-1">
                        <label className="block mb-1">Price Range</label>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filters.priceRange}
                            onChange={(e) => handleFilterChange('priceRange', parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>₹0</span>
                            <span>₹{filters.priceRange}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1">Minimum Rating</label>
                        <div className="flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.5"
                                value={filters.rating}
                                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                                className="w-24 mr-2"
                            />
                            <span className="flex items-center">
                                <FaStar className="text-yellow-400 mr-1" />
                                {filters.rating.toFixed(1)}+
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <MenuItem 
                        key={item.id} 
                        item={item} 
                        isPreviouslyOrdered={item.id === lastOrderItem}
                    />
                ))}
            </div>
            {filteredItems.length === 0 && (
                <p className="text-center text-gray-600 mt-4">No items match the current filters.</p>
            )}
        </div>
    );
};

export default PopularItems;