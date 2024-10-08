import React, { useState, useEffect } from 'react';
import { FaStar, FaMapMarkerAlt, FaPhone, FaClock, FaSpinner, FaGlobe } from 'react-icons/fa';
import { fetchAllMedicalItems } from '../services/firebaseOperations';
import MedicareChatbot from './MedicareChatbot';
import { getDistance } from 'geolib';

const MedicareHome = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.error("Error getting user location:", error);
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
            }
        };

        getUserLocation();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchAllMedicalItems();
                if (userLocation) {
                    const dataWithDistances = data.map(category => ({
                        ...category,
                        providers: category.providers.map(provider => ({
                            ...provider,
                            distance: calculateDistance(userLocation, provider)
                        }))
                    }));
                    setCategories(dataWithDistances);
                } else {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [userLocation]);

    const calculateDistance = (userLocation, provider) => {
        if (!userLocation || !provider.latitude || !provider.longitude) return 'N/A';
        return (getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: provider.latitude, longitude: provider.longitude }
        ) / 1000).toFixed(2); // Convert meters to kilometers and round to 2 decimal places
    };

    const handleItemClick = (itemName) => {
        setSelectedItem(itemName);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-[#004E89]" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-[#004E89]">Medicare Services</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {categories.map((category, index) => (
                    <div 
                        key={index} 
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                        onClick={() => setSelectedCategory(category)}
                    >
                        <img src={category.image_url} alt={category.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <h2 className="text-xl font-semibold text-center">{category.name}</h2>
                    </div>
                ))}
            </div>

            {selectedCategory && (
                <>
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">{selectedCategory.name} Items</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Object.entries(selectedCategory.items).map(([name, imageUrl], index) => (
                                <div 
                                    key={index} 
                                    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                                    onClick={() => handleItemClick(name)}
                                >
                                    <img src={imageUrl} alt={name} className="w-full h-32 object-cover rounded-lg mb-2" />
                                    <p className="text-center font-semibold">{name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-4 mt-8">Service Providers for {selectedCategory.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedCategory.providers.map((provider, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                {provider.Thumbnail && (
                                    <img src={provider.Thumbnail} alt={provider.Name} className="w-full h-48 object-cover rounded-lg mb-4" />
                                )}
                                <h3 className="text-xl font-semibold mb-2">{provider.Name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{provider.Type}</p>
                                <div className="flex items-center mb-2">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span>{provider.Rating} ({provider['Total Reviews'] || 0} reviews)</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <FaMapMarkerAlt className="text-gray-500 mr-2" />
                                    <span className="text-sm">
                                        {provider.Address}, {provider.Area}, {provider.Pincode}
                                        {provider.distance !== 'N/A' && ` (${provider.distance} km away)`}
                                    </span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <FaPhone className="text-gray-500 mr-2" />
                                    <span className="text-sm">{provider.Phone}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <FaClock className="text-gray-500 mr-2" />
                                    <span className="text-sm">{provider['Opening Time']}</span>
                                </div>
                                {provider['Web URL'] && (
                                    <div className="flex items-center mb-2">
                                        <FaGlobe className="text-gray-500 mr-2" />
                                        <a href={provider['Web URL']} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                                            Website
                                        </a>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4">
                                    <span className="font-bold text-lg">₹{provider.prize}</span>
                                    <span className={`px-2 py-1 rounded ${provider.rent === "Yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {provider.rent === "Yes" ? "Available for Rent" : "Purchase Only"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
              <MedicareChatbot userLocation={userLocation} />
        </div>
    );
};

export default MedicareHome;