import React, { useState } from 'react';
import { FaStar, FaUtensils, FaFireAlt, FaShoppingCart, FaClock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const MenuItem = ({ item, isOrderHistory = false, isPreviouslyOrdered = false }) => {
    const [quantity, setQuantity] = useState(0);
    const { addToCart } = useAuth();

    const handleAddToCart = () => {
        if (quantity === 0) {
            setQuantity(1);
        }
        addToCart(item, quantity > 0 ? quantity : 1);
    };

    const calculateDeliveryTime = (distance) => {
        if (typeof distance !== 'number') return '30-45 min';
        
        if (distance > 50) {
            // For distances over 50 km, we'll assume it's not a typical delivery
            return 'Not available for delivery';
        }
        
        // Assume an average speed of 20 km/h for delivery
        const estimatedMinutes = Math.round(distance / 20 * 60);
        
        if (estimatedMinutes < 15) return '15-20 min';
        if (estimatedMinutes < 30) return '20-30 min';
        if (estimatedMinutes < 45) return '30-45 min';
        if (estimatedMinutes < 60) return '45-60 min';
        if (estimatedMinutes < 90) return '60-90 min';
        return '90+ min';
    };

    const deliveryTime = calculateDeliveryTime(item.distance);

    const isSpecialMeal = item.productTitle.toLowerCase().includes('thali') || 
                          item.productTitle.toLowerCase().includes('combo') ||
                          item.productTitle.toLowerCase().includes('meal');

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
            <img src={item.productImg} alt={item.productTitle} className="w-full h-48 object-cover" />
            {isPreviouslyOrdered && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Previously Ordered
                </div>
            )}
            {isSpecialMeal && (
                <div className={`absolute ${isPreviouslyOrdered ? 'top-10' : 'top-2'} left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded`}>
                    Special Meal
                </div>
            )}
            {!item.isVeg && (
                <div className="absolute top-2 right-2">
                    <div className="w-0 h-0 border-t-8 border-r-8 border-transparent border-r-red-500"></div>
                </div>
            )}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold">{item.productTitle}</h3>
                    <div className="flex items-center bg-green-100 px-1 py-1 rounded text-sm">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-semibold">{item.productRating ? item.productRating.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                    <FaUtensils className="mr-1 text-gray-400" />
                    <span>{item.hotelName}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.productDesc}</p>
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">₹{item.productPrice}</p>
                    <span className="text-sm text-gray-500 flex items-center">
                        <FaFireAlt className="text-orange-500 mr-1" />
                        {item.calories || 600} cal
                    </span>
                    {item.isVeg ? (
                        <div className="border border-green-500 p-0.5 rounded">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    ) : (
                        <div className="border border-red-500 p-0.5 rounded">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    )}
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center">
                        <FaClock className="mr-1 text-blue-500" />
                        Delivery: {deliveryTime}
                    </span>
                    {!isOrderHistory && (
                        <button
                            onClick={handleAddToCart}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300 flex items-center"
                        >
                            <FaShoppingCart className="mr-2" />
                            {quantity > 0 ? `Add (${quantity})` : 'Add'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuItem;