import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CheckoutPopup = ({ onClose, cart, totalPrice, onOrderPlaced }) => {
  const { user, clearCart } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          items: cart,
          totalPrice,
          deliveryAddress,
          phoneNumber,
          paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

       // Simulate processing time
       setTimeout(() => {
        setIsProcessing(false);
        setOrderConfirmed(true);
        clearCart();
        onOrderPlaced(); // Call this function to refresh order history
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      // Handle error (e.g., show error message to user)
    }
  };

  if (orderConfirmed) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
          <p>Your order has been successfully placed.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Delivery Address</label>
            <select
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Address</option>
              <option value={user.homeAddress}>Home Address</option>
              <option value={user.workAddress}>Work Address</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing Order...' : 'Place Order'}
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CheckoutPopup;