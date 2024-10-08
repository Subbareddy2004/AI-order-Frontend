import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import LandingPage from './components/LandingPage';
import FoodOrderHome from './components/FoodOrderHome';
import HotelPage from './components/HotelPage';
import MedicareHome from './components/MedicareHome'; 
import PopularItems from './components/PopularItems';
import AllItems from './components/AllItems';
import Cart from './components/Cart';
import CategoryItems from './components/CategoryItems';
import VoiceAssistant from './components/VoiceAssistant';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';



function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/" element={<PrivateRoute><LandingPage /></PrivateRoute>} />
                    <Route path="/hotel/:id" element={<HotelPage />} />
                    <Route path="/popular-items" element={<PrivateRoute><PopularItems /></PrivateRoute>} />
                    <Route path="/all-menu" element={<PrivateRoute><AllItems /></PrivateRoute>} />
                    <Route path="/food-order" element={<PrivateRoute><FoodOrderHome /></PrivateRoute>} />
                    <Route path="/medicare" element={<PrivateRoute><MedicareHome /></PrivateRoute>} /> {/* Add this line */}
                    <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                    <Route path="/category/:categoryName" element={<PrivateRoute><CategoryItems /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="/voice-assistant" element={<VoiceAssistant />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;