import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart,FaMicrophone } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout, cart } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Calculate total items in cart
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="bg-[#004E89] p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold">Ecub Services</Link>
                <div className="flex items-center">
                    {user ? (
                        <>
                        <Link to="/voice-assistant" className="text-white mr-4 relative">
                            <FaMicrophone size={20} />
                        </Link>
                            <Link to="/cart" className="text-white mr-4 relative">
                                <FaShoppingCart size={20} />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/profile" className="text-white mr-4">
                                <FaUser size={20} />
                            </Link>
                            <button onClick={handleLogout} className="text-white">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white mr-4">Login</Link>
                            <Link to="/signup" className="text-white">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;