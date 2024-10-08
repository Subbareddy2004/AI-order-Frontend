import React, { useState, useEffect } from 'react';
import { getNearbyHotels } from '../services/api';
import { FaMapMarkerAlt, FaPhone, FaUtensils, FaHome } from 'react-icons/fa';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchNearbyHotels(latitude, longitude);
        },
        error => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by your browser.");
    }
  };

  const fetchNearbyHotels = async (latitude, longitude) => {
    try {
      const nearbyHotels = await getNearbyHotels(latitude, longitude);
      setHotels(nearbyHotels);
    } catch (error) {
      console.error("Error fetching nearby hotels:", error);
    }
  };

  return (
    <div className="nearby-hotels">
      {hotels.map(hotel => (
        <div key={hotel.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-xl font-semibold">{hotel.name}</h3>
          <div className="flex items-center mt-2">
            <FaMapMarkerAlt className="text-gray-500 mr-2" />
            <p className="text-gray-600">{hotel.address}</p>
          </div>
          <div className="flex items-center mt-2">
            <FaPhone className="text-gray-500 mr-2" />
            <p className="text-gray-600">{hotel.phone}</p>
          </div>
          <div className="flex items-center mt-2">
            {hotel.type === 'restaurant' ? (
              <FaUtensils className="text-gray-500 mr-2" />
            ) : (
              <FaHome className="text-gray-500 mr-2" />
            )}
            <p className="text-gray-600">{hotel.type === 'restaurant' ? 'Restaurant' : 'Homemade'}</p>
          </div>
          {hotel.distance !== undefined && (
            <p className="text-gray-600 mt-2">Distance: {hotel.distance.toFixed(2)} km</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Hotels;