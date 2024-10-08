import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaStar, FaPlus, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import { getPersonalizedRecommendations } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Add this import

const ChatBot = ({ onRecommendations, addToCart, userLocation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [mealType, setMealType] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const messagesEndRef = useRef(null);
    const { addToCart: authAddToCart } = useAuth(); // Add this line to get addToCart function

    useEffect(() => {
        if (isOpen) {
            setMessages([{ text: "Welcome! What type of meal are you looking for?", sender: 'bot' }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, recommendations]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleMealTypeSelect = async (type) => {
        setMealType(type);
        setMessages(prev => [...prev, { text: type, sender: 'user' }, { text: `Great! Here are some ${type} options for you. You can also search for specific items.`, sender: 'bot' }]);
        setIsLoading(true);
        setIsSearching(true);
        try {
            // Add a timestamp to force a new request each time
            const timestamp = new Date().getTime();
            const recs = await getPersonalizedRecommendations('', type, userLocation, timestamp);
            setRecommendations(recs);
            onRecommendations(recs);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setMessages(prev => [...prev, { text: "Sorry, I couldn't fetch recommendations at the moment. Please try again.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setIsSearching(true);

        try {
            const recs = await getPersonalizedRecommendations(input, mealType, userLocation);
            setRecommendations(recs);
            onRecommendations(recs);
            
            if (recs.length === 0) {
                setMessages(prev => [...prev, { text: "I couldn't find any items matching your request. Can you try a different search?", sender: 'bot' }]);
            } else {
                setMessages(prev => [...prev, { text: "Here are some recommendations based on your request:", sender: 'bot' }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { text: "Sorry, we don't have any items matching your request. Please try a different search.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }

        setInput('');
    };

    const handleAdd = (item) => {
        authAddToCart(item, 1); // Add 1 quantity of the item to the cart
    };

    const RecommendedItem = ({ item }) => (
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 flex items-center">
            <img src={item.productImg} alt={item.productTitle} className="w-16 h-16 object-cover rounded-lg mr-2" />
            <div className="flex-grow">
                <h4 className="font-semibold">{item.productTitle}</h4>
                <p className="text-sm text-gray-600">₹{item.productPrice}</p>
                <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm">{item.productRating ? item.productRating.toFixed(1) : 'N/A'}</span>
                </div>
                <p className="text-sm text-gray-600">{item.hotelName || item.productOwnership || 'Unknown Hotel'}</p>
                {item.distance !== null && item.distance !== undefined && (
                    <p className="text-sm text-gray-600">
                        <FaMapMarkerAlt className="inline mr-1" />
                        {`${item.distance.toFixed(2)} km away`}
                    </p>
                )}
            </div>
            <button 
                onClick={() => {
                    handleAdd(item);
                    setMessages(prev => [...prev, { text: `Added ${item.productTitle} to cart`, sender: 'bot' }]);
                }}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition duration-300"
            >
                <FaPlus />
            </button>
        </div>
    );

    return (
        <div className={`fixed bottom-4 right-4 z-50 ${isOpen ? 'w-96' : 'w-auto'}`}>
            {!isOpen && (
                <button 
                    className="chatbot-button bg-[#FF6B35] text-white p-4 rounded-full shadow-lg hover:bg-[#F7C59F] hover:text-[#004E89] transition duration-300"
                    onClick={toggleChat}
                >
                    <FaComments size={28} />
                </button>
            )}
            {isOpen && (
                <div className="bg-[#FF6B35] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Chat with Bot</h3>
                    <button onClick={toggleChat} className="text-white hover:text-[#F7C59F]">
                        <FaTimes size={24} />
                    </button>
                </div>
            )}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="h-[480px] overflow-y-auto p-4 bg-gray-100">
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-[#004E89] text-white' : 'bg-[#F7C59F] text-[#333333]'}`}>
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {(isLoading || isSearching) && (
                            <div className="text-center py-2">
                                <FaSpinner className="animate-spin inline-block mr-2 text-[#FF6B35]" />
                                <span className="text-[#004E89]">Searching for items...</span>
                            </div>
                        )}
                        {!mealType && (
                            <div className="flex justify-center space-x-2 mt-4">
                                {['breakfast', 'lunch', 'dinner'].map((type) => (
                                    <button 
                                        key={type}
                                        onClick={() => handleMealTypeSelect(type)}
                                        className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm hover:bg-[#F7C59F] hover:text-[#004E89] transition duration-300"
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                        {recommendations.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Recommended Items:</h4>
                                {recommendations.map((item) => (
                                    <RecommendedItem key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-gray-200">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Search for items..."
                                className="flex-grow p-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                className="bg-[#FF6B35] text-white p-3 rounded-r-lg hover:bg-[#F7C59F] hover:text-[#004E89] transition duration-300"
                            >
                                <FaPaperPlane size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;