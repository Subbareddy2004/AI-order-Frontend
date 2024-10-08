import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaLeaf, FaFilter, FaSpinner, FaArrowLeft, FaRupeeSign } from 'react-icons/fa';
import { fetchAllItems } from '../services/firebaseOperations';
import { useAuth } from '../contexts/AuthContext';
import MenuItem from './MenuItem';

const AllItems = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        veg: false,
        priceRange: [0, 1000],
        rating: 0
    });
    const { userLocation } = useAuth();

    useEffect(() => {
        const loadItems = async () => {
            setIsLoading(true);
            try {
                const itemsData = await fetchAllItems(userLocation || null);
                const itemsWithRestaurantNames = itemsData.map(item => ({
                    ...item,
                    restaurantName: item.restaurantName || 'Unknown Restaurant'
                }));
                setItems(itemsWithRestaurantNames);
                setFilteredItems(itemsWithRestaurantNames);
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadItems();
    }, [userLocation]);

    useEffect(() => {
        const filtered = items.filter(item => 
            (!filters.veg || item.isVeg) &&
            item.productPrice >= filters.priceRange[0] &&
            item.productPrice <= filters.priceRange[1] &&
            item.productRating >= filters.rating
        );
        setFilteredItems(filtered);
    }, [filters, items]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <Link to="/food-order" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6">
                    <FaArrowLeft className="mr-2" /> Back to Restaurants
                </Link>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">All Menu Items</h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
                        <FaFilter className="mr-2 text-blue-500" /> Filters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <label className="flex items-center space-x-2 text-gray-700">
                            <input
                                type="checkbox"
                                checked={filters.veg}
                                onChange={(e) => handleFilterChange('veg', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-green-500"
                            />
                            <span>Vegetarian Only</span>
                            <FaLeaf className="text-green-500" />
                        </label>
                        <div>
                            <label className="block mb-2 text-gray-700">Price Range</label>
                            <div className="flex items-center space-x-2">
                                <FaRupeeSign className="text-gray-500" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="10"
                                    value={filters.priceRange[1]}
                                    onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                                    className="w-full"
                                />
                                <span className="text-gray-700">₹{filters.priceRange[1]}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-700">Minimum Rating</label>
                            <select
                                value={filters.rating}
                                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                                className="w-full p-2 border rounded-md bg-white text-gray-700"
                            >
                                <option value="0">All Ratings</option>
                                <option value="3">3+ Stars</option>
                                <option value="4">4+ Stars</option>
                                <option value="4.5">4.5+ Stars</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map(item => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No items match the current filters.</p>
                        <button 
                            onClick={() => setFilters({veg: false, priceRange: [0, 1000], rating: 0})}
                            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllItems;