import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaSpinner, FaMapMarkerAlt, FaPhone, FaStar, FaMoneyBillWave, FaInfoCircle, FaClock, FaGlobe, FaWheelchair } from 'react-icons/fa';
import { fetchMedicareData } from '../services/firebaseOperations';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDistance } from 'geolib';

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const MedicareChatbot = ({ userLocation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [medicareData, setMedicareData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const [selectedProvider, setSelectedProvider] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (userLocation) {
                const data = await fetchMedicareData(userLocation.latitude, userLocation.longitude);
                setMedicareData(data);
            }
        };

        if (userLocation) {
            loadData();
        }
    }, [userLocation]);

    useEffect(() => {
        if (medicareData.length > 0 && messages.length === 0) {
            addBotMessage({
                type: 'text',
                content: "Welcome to Medicare Services! How can I assist you today?"
            });
            addBotMessage({
                type: 'options',
                content: "Please choose a category:",
                options: medicareData.map(category => category.name)
            });
        }
    }, [medicareData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addBotMessage = (message) => {
        setMessages(prev => [...prev, { sender: 'bot', ...message }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { sender: 'user', text }]);
    };

    const handleOptionClick = (option) => {
        addUserMessage(option);
        processUserInput(option);
    };

    const processUserInput = async (input) => {
        setIsLoading(true);
        if (!selectedCategory) {
            handleCategorySelection(input);
        } else {
            await handleUserQuery(input);
        }
        setIsLoading(false);
    };

    const handleUserQuery = async (query) => {
        const lowercaseQuery = query.toLowerCase();
        const itemRequested = Object.keys(selectedCategory.items).find(item => 
            lowercaseQuery.includes(item.toLowerCase()) ||
            item.toLowerCase().includes(lowercaseQuery)
        );

        // Extract pincode from query (assuming 6-digit format)
        const pincodeMatch = query.match(/\b\d{6}\b/);
        const userPincode = pincodeMatch ? pincodeMatch[0] : '625001'; // Default to Madurai pincode if not provided

        if (itemRequested || lowercaseQuery.includes('walker')) {
            suggestServiceProviders(itemRequested || 'walker', userPincode);
        } else {
            addBotMessage({
                type: 'text',
                content: `I'm sorry, I couldn't find a specific item matching "${query}" in our ${selectedCategory.name} category. Can you please try another item or ask for general ${selectedCategory.name} providers?`
            });
        }
    };

    const suggestServiceProviders = (item, userPincode) => {
        let providers = selectedCategory.providers;
        
        // Filter providers based on the item
        providers = providers.filter(provider => 
            provider.Name.toLowerCase().includes(item.toLowerCase()) ||
            (provider.Categories && provider.Categories.toLowerCase().includes(item.toLowerCase()))
        );

        if (providers.length > 0) {
            // Sort providers by rating (assuming higher is better)
            providers.sort((a, b) => (b.Rating || 0) - (a.Rating || 0));

            let response = `Here are 5 top-rated providers for ${item} in the ${selectedCategory.name} category:\n\n`;
            
            providers.slice(0, 5).forEach((provider, index) => {
                response += `${index + 1}. ${provider.Name}\n`;
                response += `   📍 ${provider.Address || provider.Area || 'Address not available'}\n`;
                response += `   📞 ${provider.Phone || 'Phone not available'}\n`;
                response += `   ⭐ ${provider.Rating || 'N/A'} stars (${provider['Total Reviews'] || 0} reviews)\n`;
                response += `   💰 Price: ${provider.prize ? `₹${provider.prize}` : 'Not available'}\n`;
                response += `   ${provider.rent === "Yes" ? "🔄 Available for Rent" : "🛒 Purchase Only"}\n\n`;
            });

            addBotMessage({
                type: 'text',
                content: response
            });
        } else {
            addBotMessage({
                type: 'text',
                content: `I'm sorry, I couldn't find any providers for ${item} in our database. Can you please try a different item or ask for general ${selectedCategory.name} providers?`
            });
        }
    };

    const handleCategorySelection = (category) => {
        const selectedCat = medicareData.find(cat => cat.name === category);
        if (selectedCat) {
            setSelectedCategory(selectedCat);
            addBotMessage({
                type: 'text',
                content: `Great! You've selected ${category}. Here are some top providers for ${category}:`
            });
            
            // Sort providers by rating
            const sortedProviders = selectedCat.providers.sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
            
            sortedProviders.slice(0, 5).forEach((provider, index) => {
                addBotMessage({
                    type: 'provider',
                    content: provider
                });
            });
            
            addBotMessage({
                type: 'text',
                content: "How can I assist you further? You can ask about specific items or request more information about any provider."
            });

            // Format the items object into a string for context
            const itemsInfo = Object.keys(selectedCat.items).join(', ');

            setChatHistory([{
                role: "user",
                parts: [`You are a helpful assistant specializing in ${category} medical equipment. Available items include: ${itemsInfo}`]
            }]);
        } else {
            addBotMessage({
                type: 'text',
                content: "I'm sorry, I didn't recognize that category. Please choose from the options provided."
            });
        }
    };

    const getGeminiResponse = async (query) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            // Prepare the chat history in the correct format
            const formattedChatHistory = chatHistory.map(message => ({
                role: message.role === "system" ? "user" : message.role, // Change "system" to "user"
                parts: [{ text: message.parts[0] }]
            }));

            // Add the new user query
            formattedChatHistory.push({
                role: "user",
                parts: [{ text: query }]
            });

            const result = await model.generateContent({
                contents: formattedChatHistory,
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const response = result.response;
            const textResponse = response.text();
            
            addBotMessage({
                type: 'text',
                content: textResponse
            });
            
            setChatHistory([
                ...formattedChatHistory,
                { role: "model", parts: [textResponse] }
            ]);
        } catch (error) {
            console.error("Error getting Gemini response:", error);
            addBotMessage({
                type: 'text',
                content: "I'm sorry, I encountered an error while processing your request. Please try again later."
            });
        }
    };

    const handleSend = async () => {
        if (input.trim() === '') return;
        addUserMessage(input);
        await processUserInput(input);
        setInput('');
    };

    const toggleChat = () => setIsOpen(!isOpen);

    const handleViewDetails = (provider) => {
        setSelectedProvider(provider);
    };

    const renderProviderCard = (provider) => {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 className="font-bold text-lg mb-2">{provider.Name}</h3>
                <div className="flex items-center mb-1">
                    <FaMapMarkerAlt className="mr-2 text-gray-600" />
                    <p className="text-sm">
                        {provider.Address || provider.Area || 'Address not available'}
                        {provider.distance !== 'N/A' && ` (${provider.distance.toFixed(2)} km away)`}
                    </p>
                </div>
                <div className="flex items-center mb-1">
                    <FaPhone className="mr-2 text-gray-600" />
                    <p className="text-sm">{provider.Phone || 'Phone not available'}</p>
                </div>
                <div className="flex items-center mb-1">
                    <FaStar className="mr-2 text-yellow-400" />
                    <p className="text-sm">{provider.Rating || 'N/A'} stars ({provider['Total Reviews'] || 0} reviews)</p>
                </div>
                {provider.prize && (
                    <div className="flex items-center mb-1">
                        <FaMoneyBillWave className="mr-2 text-green-600" />
                        <p className="text-sm">Price: ₹{provider.prize}</p>
                    </div>
                )}
                <div className="flex items-center mb-1">
                    <p className="text-sm text-blue-600">
                        Distance: {provider.distance !== 'N/A' ? `${provider.distance.toFixed(2)} km` : 'N/A'}
                    </p>
                </div>
                <button 
                    onClick={() => handleViewDetails(provider)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
                >
                    <FaInfoCircle className="mr-2" />
                    View Details
                </button>
            </div>
        );
    };

    const renderDetailModal = () => {
        if (!selectedProvider) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-blue-600">{selectedProvider.Name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start mb-2">
                            <FaMapMarkerAlt className="mr-2 mt-1 text-gray-600" />
                            <div>
                                <p className="font-semibold">Address:</p>
                                <p>{selectedProvider.Address || selectedProvider.Area || 'Not available'}</p>
                            </div>
                        </div>
                        <div className="flex items-start mb-2">
                            <FaPhone className="mr-2 mt-1 text-gray-600" />
                            <div>
                                <p className="font-semibold">Phone:</p>
                                <p>{selectedProvider.Phone || 'Not available'}</p>
                            </div>
                        </div>
                        <div className="flex items-start mb-2">
                            <FaStar className="mr-2 mt-1 text-yellow-400" />
                            <div>
                                <p className="font-semibold">Rating:</p>
                                <p>{selectedProvider.Rating || 'N/A'} stars ({selectedProvider['Total Reviews'] || 0} reviews)</p>
                            </div>
                        </div>
                        <div className="flex items-start mb-2">
                            <FaMoneyBillWave className="mr-2 mt-1 text-green-600" />
                            <div>
                                <p className="font-semibold">Price:</p>
                                <p>₹{selectedProvider.prize || 'Not available'}</p>
                            </div>
                        </div>
                        <div className="flex items-start mb-2">
                            <FaClock className="mr-2 mt-1 text-gray-600" />
                            <div>
                                <p className="font-semibold">Opening Time:</p>
                                <p>{selectedProvider['Opening Time'] || 'Not available'}</p>
                            </div>
                        </div>
                        <div className="flex items-start mb-2">
                            <FaWheelchair className="mr-2 mt-1 text-gray-600" />
                            <div>
                                <p className="font-semibold">Categories:</p>
                                <p>{selectedProvider.Categories || 'Not available'}</p>
                            </div>
                        </div>
                    </div>
                    {selectedProvider['Web URL'] && (
                        <div className="mt-4">
                            <a href={selectedProvider['Web URL']} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                                <FaGlobe className="mr-2" />
                                Visit Website
                            </a>
                        </div>
                    )}
                    <button 
                        onClick={() => setSelectedProvider(null)}
                        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; // Distance in km
        return d.toFixed(2);
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 ${isOpen ? 'w-96' : 'w-auto'}`}>
            {!isOpen && (
                <button 
                    className="bg-[#FF6B35] text-white p-4 rounded-full shadow-lg hover:bg-[#F7C59F] hover:text-[#004E89] transition duration-300"
                    onClick={toggleChat}
                >
                    <FaComments size={28} />
                </button>
            )}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-[#FF6B35] text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Medicare Chatbot</h3>
                        <button onClick={toggleChat} className="text-white hover:text-[#F7C59F]">
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <div className="h-[480px] overflow-y-auto p-4 bg-gray-100">
                        {messages.map((message, index) => (
                            <div key={index} className={`my-2 ${message.sender === 'bot' ? 'ml-2' : 'mr-2'}`}>
                                {message.sender === 'bot' && message.type === 'provider' ? (
                                    renderProviderCard(message.content)
                                ) : message.sender === 'bot' && message.type === 'options' ? (
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <p className="mb-2">{message.content}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {message.options.map((option, optionIndex) => (
                                                <button
                                                    key={optionIndex}
                                                    onClick={() => handleCategorySelection(option)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`p-3 rounded-lg ${message.sender === 'bot' ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                                        {message.content}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-center py-2">
                                <FaSpinner className="animate-spin inline-block mr-2 text-[#FF6B35]" />
                                <span className="text-[#004E89]">Processing your request...</span>
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
                                placeholder="Type your message..."
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
            {renderDetailModal()}
        </div>
    );
};

export default MedicareChatbot;