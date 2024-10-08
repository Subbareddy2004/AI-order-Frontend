import React, { useState, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { sendMessage, getPersonalizedRecommendations } from '../services/api';

const ChatInterface = ({ onRecommendations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [mealType, setMealType] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMessages([{ text: "Welcome! What type of meal are you looking for?", sender: 'bot' }]);
        }
    }, [isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleMealTypeSelect = async (type) => {
        setMealType(type);
        setMessages(prev => [...prev, { text: type, sender: 'user' }, { text: `Great! Here are some ${type} options for you.`, sender: 'bot' }]);
        const recommendations = await getPersonalizedRecommendations('', type);
        onRecommendations(recommendations);
    };

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await sendMessage(input);
            const botMessage = { text: response.message, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
            
            const recommendations = await getPersonalizedRecommendations(input, mealType);
            onRecommendations(recommendations);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        setInput('');
    };

    return (
        <div className={`chat-interface ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chat-toggle" onClick={toggleChat}>
                    <FaComments />
                </button>
            )}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Chat with Bot</h3>
                        <button className="close-chat" onClick={toggleChat}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        ))}
                        {!mealType && (
                            <div className="meal-type-buttons">
                                <button onClick={() => handleMealTypeSelect('breakfast')}>Breakfast</button>
                                <button onClick={() => handleMealTypeSelect('lunch')}>Lunch</button>
                                <button onClick={() => handleMealTypeSelect('dinner')}>Dinner</button>
                            </div>
                        )}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button onClick={handleSend}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;