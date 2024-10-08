import React from 'react';
import { FaStar } from 'react-icons/fa';

const HotelItem = ({ hotel, userLocation }) => {
    return (
        <div className="hotel-item">
            <img src={hotel.image} alt={hotel.name} className="hotel-image" />
            <div className="hotel-info">
                <h3>{hotel.name}</h3>
                <p>{hotel.cuisine ? hotel.cuisine.join(', ') : 'Cuisine not available'}</p>
                <div className="rating">
                    <FaStar /> {hotel.rating || 'N/A'}
                </div>
                {/* Add more hotel details as needed */}
            </div>
        </div>
    );
};

export default HotelItem;