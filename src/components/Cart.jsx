import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaHistory } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import CheckoutPopup from './CheckoutPopup';
import axios from 'axios';

const Cart = () => {
    const { user, cart, removeFromCart, updateQuantity, clearCart } = useAuth();
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const totalPrice = cart.reduce((total, item) => total + (item.productPrice || 0) * item.quantity, 0);

    const fetchOrderHistory = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token);
            if (!user || (!user._id && !user.id)) {
                console.log('User or user ID is missing:', user);
                throw new Error('User ID is not available');
            }
            const userId = user._id || user.id;
            console.log('Fetching order history for user:', userId);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Order history response:', response.data);
            setOrderHistory(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching order history:', error.response ? error.response.data : error.message);
            setError('Failed to fetch order history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('User in Cart component:', user);
        if (user) {
            fetchOrderHistory();
        }
    }, [user]);

    const handleOrderPlaced = () => {
        fetchOrderHistory();  // Fetch order history immediately after placing an order
        setShowCheckout(false);  // Close the checkout popup
        clearCart();  // Clear the cart after successful order
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 text-[#004E89] flex items-center">
                <FaShoppingCart className="mr-3 text-[#FF6B35]" /> Your Cart
            </h2>
            {cart.length === 0 ? (
                <p className="text-gray-600 text-xl">Your cart is empty</p>
            ) : (
                <>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center border-b border-gray-200 py-4 px-6 hover:bg-gray-50 transition duration-150">
                                <img src={item.productImg} alt={item.productTitle} className="w-20 h-20 object-cover rounded-md mr-6" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-[#004E89]">{item.productTitle}</h3>
                                    <p className="text-[#FF6B35] font-bold mt-1">₹{((item.productPrice || 0) * item.quantity).toFixed(2)}</p>
                                    <div className="flex items-center mt-2">
                                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300 transition duration-150">
                                            <FaMinus />
                                        </button>
                                        <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300 transition duration-150">
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition duration-150">
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-2xl font-bold text-[#004E89] mb-4">Total: ₹{totalPrice.toFixed(2)}</h3>
                <div className="flex space-x-4">
                    <button onClick={clearCart} className="bg-[#FF6B35] text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#F7C59F] hover:text-[#004E89] transition duration-300">
                        Clear Cart
                    </button>
                    <button 
                        onClick={() => setShowCheckout(true)} 
                        className="bg-[#004E89] text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#F7C59F] hover:text-[#004E89] transition duration-300"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
                </>
            )}

            {/* Order History Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-[#004E89] flex items-center">
                    <FaHistory className="mr-3 text-[#FF6B35]" /> Order History
                </h2>
                {isLoading ? (
                    <p className="text-gray-600 text-xl">Loading order history...</p>
                ) : error ? (
                    <p className="text-red-500 text-xl">{error}</p>
                ) : orderHistory.length === 0 ? (
                    <p className="text-gray-600 text-xl">No previous orders found</p>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        {orderHistory.map(order => (
                            <div key={order._id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition duration-150">
                                <p className="font-semibold text-lg text-[#004E89]">Order ID: {order._id}</p>
                                <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-[#FF6B35] font-bold">Total: ₹{order.totalPrice?.toFixed(2) || 'N/A'}</p>
                                <ul className="mt-2">
                                    {order.items.map(item => (
                                        <li key={item._id} className="text-gray-700">
                                            {item.productTitle} - Quantity: {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showCheckout && (
                <CheckoutPopup
                    onClose={() => setShowCheckout(false)}
                    cart={cart}
                    totalPrice={totalPrice}
                    onOrderPlaced={handleOrderPlaced}
                />
            )}
        </div>
    );
};

export default Cart;