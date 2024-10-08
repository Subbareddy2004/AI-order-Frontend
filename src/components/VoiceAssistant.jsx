import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { textToSpeech, speechToText } from '../services/googleSpeechServices';
import { getPersonalizedRecommendations, addToCart } from '../services/api';
import './VoiceAssistant.css'; // Make sure to create this CSS file

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [aiCart, setAiCart] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceFlow, setVoiceFlow] = useState(null);

  const audioContext = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const welcomeMessage = "Hello! I'm your voice assistant. How can I help you today?";
    setBotResponse(welcomeMessage);
    speak(welcomeMessage);
  }, []);

  const startListening = () => {
    setIsListening(true);
    setVoiceFlow('user');
    audioChunks.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          try {
            const text = await speechToText(audioBlob);
            setTranscript(text);
            await processVoiceCommand(text);
          } catch (error) {
            console.error('Error processing speech:', error);
            speak("I'm sorry, I couldn't understand that. Could you please try again?");
          }
        };
        mediaRecorder.current.start();
      });
  };

  const stopListening = () => {
    setIsListening(false);
    setVoiceFlow(null);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };

  const speak = async (text) => {
    try {
      setIsSpeaking(true);
      setVoiceFlow('bot');
      const audioContent = await textToSpeech(text);
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioBuffer = await audioContext.current.decodeAudioData(audioContent);
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);
      source.start(0);
      source.onended = () => {
        setIsSpeaking(false);
        setVoiceFlow(null);
        startListening(); // Automatically start listening after bot finishes speaking
      };
      setBotResponse(text);
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsSpeaking(false);
      setVoiceFlow(null);
      startListening(); // Automatically start listening even if there's an error
    }
  };

  const processVoiceCommand = async (command) => {
    try {
      const recommendations = await getPersonalizedRecommendations(command);
      
      if (recommendations.length > 0) {
        const item = recommendations[0];
        const quantity = extractQuantity(command) || 1;
        
        addToAiCart(item, quantity);
        await addToCart(item.id, quantity);
        
        speak(`Added ${quantity} ${item.productTitle} to your cart. Is there anything else you'd like to order?`);
      } else {
        speak("I'm sorry, I couldn't find any items matching your request. Could you please try again?");
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speak("I'm sorry, there was an error processing your request. Please try again.");
    }
  };

  const extractQuantity = (command) => {
    const words = command.split(' ');
    const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    for (let i = 0; i < words.length; i++) {
      if (!isNaN(words[i])) {
        return parseInt(words[i]);
      }
      const index = numberWords.indexOf(words[i].toLowerCase());
      if (index !== -1) {
        return index + 1;
      }
    }
    return null;
  };

  const addToAiCart = (item, quantity) => {
    setAiCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  return (
    <div className="voice-assistant fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="mb-4">
          <p className="text-gray-700">{botResponse}</p>
        </div>
        <div className="voice-waves mb-4">
          {isListening && (
            <>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </>
          )}
        </div>
        {transcript && (
          <div className="mb-4">
            <p className="text-green-600">You: {transcript}</p>
          </div>
        )}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-full ${
            isListening
              ? 'bg-green-500 hover:bg-green-600'
              : isSpeaking
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isListening ? <FaStop /> : <FaMicrophone />}
        </button>
        <div className="ai-cart mt-4 bg-gray-100 p-2 rounded">
          <h3 className="text-lg font-bold mb-2">AI Cart</h3>
          {aiCart.length > 0 ? (
            <ul>
              {aiCart.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-1">
                  <span>{item.productTitle}</span>
                  <span className="font-semibold">x{item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Your cart is empty</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;