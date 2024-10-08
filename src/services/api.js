import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const sendMessage = async (message, mealType, userLocation) => {
    const response = await axios.post(`${API_URL}/api/chat`, {
        message,
        mealType,
        userLocation
    });
    return response.data;
};

// Add this function to the existing api.js file
export const addToCart = async (itemId, quantity) => {
    try {
      const response = await axios.post(`${API_URL}/api/cart/add`, { itemId, quantity });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

export const getPersonalizedRecommendations = async (query, mealType, userLocation, timestamp) => {
    try {
        const response = await axios.get(`${API_URL}/api/personalized-recommendations`, {
            params: {
                query,
                mealType,
                latitude: userLocation ? userLocation.latitude : null,
                longitude: userLocation ? userLocation.longitude : null,
                timestamp // Add this line
            }
        });
        if (response.data && Array.isArray(response.data)) {
            return response.data.map(item => ({
                ...item,
                productRating: item.productRating || 0,
                hotelName: item.hotelName || item.productOwnership || 'Unknown Hotel',
                distance: typeof item.distance === 'number' ? Number(item.distance.toFixed(2)) : null
            }));
        } else {
            console.error('Invalid recommendations format:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        return [];
    }
};

export const fetchPopularItems = async () => {
    const response = await fetch(`${API_BASE_URL}/api/popular-items`);
    if (!response.ok) {
        throw new Error('Failed to fetch popular items');
    }
    return response.json();
};

export const getPopularItems = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/popular-items`);
    return response.data;
};

export const getNearbyHotels = async (latitude, longitude) => {
    const response = await axios.get(`${API_BASE_URL}/api/nearby-hotels`, {
        params: { latitude: latitude.toString(), longitude: longitude.toString() }
    });
    return response.data;
};