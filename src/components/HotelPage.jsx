import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchHotelDetails } from '../services/firebaseOperations';
import MenuItem from './MenuItem';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaStar, FaLeaf, FaRupeeSign } from 'react-icons/fa';

const HotelPage = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [filters, setFilters] = useState({
        vegOnly: false,
        minRating: 0,
        maxPrice: 1000
    });

    useEffect(() => {
        const loadHotelDetails = async () => {
            try {
                const hotelData = await fetchHotelDetails(id);
                setHotel(hotelData);
                if (hotelData.menuItems && hotelData.menuItems.length > 0) {
                    setFilteredItems(hotelData.menuItems);
                }
            } catch (error) {
                console.error('Error loading hotel details:', error);
            }
        };
        loadHotelDetails();
    }, [id]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: value
        }));
    };

    useEffect(() => {
        if (hotel) {
            const filtered = hotel.menuItems.filter(item => 
                (!filters.vegOnly || item.isVeg) &&
                item.productRating >= filters.minRating &&
                item.productPrice <= filters.maxPrice
            );
            setFilteredItems(filtered);
        }
    }, [filters, hotel]);

    if (!hotel) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <Link to="/food-order" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6">
                    <FaArrowLeft className="mr-2" /> Back to Restaurants
                </Link>
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold mb-4">{hotel.hotelName}</h1>
                    <p className="text-gray-600 mb-2">{hotel.hotelType}</p>
                    <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-gray-500 mr-2" />
                        <span>{hotel.hotelAddress}</span>
                    </div>
                    <div className="flex items-center">
                        <FaPhone className="text-gray-500 mr-2" />
                        <span>{hotel.hotelPhoneNo}</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <label className="flex items-center space-x-2 text-gray-700">
                            <input
                                type="checkbox"
                                checked={filters.vegOnly}
                                onChange={(e) => handleFilterChange('vegOnly', e.target.checked)}
                                className="form-checkbox h-5 w-5 text-green-500"
                            />
                            <span>Vegetarian Only</span>
                            <FaLeaf className="text-green-500" />
                        </label>
                        <div>
                            <label className="block mb-2 text-gray-700">Minimum Rating</label>
                            <div className="flex items-center space-x-2">
                                <FaStar className="text-yellow-400" />
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={filters.minRating}
                                    onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-gray-700">{filters.minRating}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-700">Max Price</label>
                            <div className="flex items-center space-x-2">
                                <FaRupeeSign className="text-gray-500" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-gray-700">₹{filters.maxPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <MenuItem 
                                key={item.id} 
                                item={item} 
                                addToCart={(item, quantity) => {
                                    console.log(`Added ${quantity} of ${item.productTitle} to cart`);
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-xl text-gray-600">No menu items available for this hotel.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelPage;