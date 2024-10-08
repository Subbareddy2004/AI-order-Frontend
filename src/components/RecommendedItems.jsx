import React from 'react';
import { FaStar, FaMinus, FaPlus } from 'react-icons/fa';

const MenuItem = ({ item, addToCart }) => {
    const [quantity, setQuantity] = React.useState(0);

    const handleAdd = () => {
        if (quantity > 0) {
            addToCart(item, quantity);
            setQuantity(0);
        }
    };

    return (
        <div className="menu-item">
            {item.productOffer > 0 && <span className="offer-tag">{item.productOffer}% OFF</span>}
            <div className="item-details">
                <h3>{item.productTitle}</h3>
                <div className="rating">
                    <FaStar color="#FFD700" />
                    <span>{item.productRating.toFixed(1)} ratings</span>
                </div>
                <div className="price">
                    <span className="current-price">₹{item.productPrice}</span>
                    {item.productOffer > 0 && (
                        <span className="original-price">
                            ₹{Math.round(item.productPrice / (1 - item.productOffer / 100))}
                        </span>
                    )}
                </div>
                <p className="description">{item.productDesc}</p>
                <p className="prep-time">Prep Time: {item.productPrepTime}</p>
                <p className="food-type">{item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                <div className="item-actions">
                    <div className="quantity-control">
                        <button onClick={() => setQuantity(Math.max(0, quantity - 1))}><FaMinus /></button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}><FaPlus /></button>
                    </div>
                    <button onClick={handleAdd} className="add-button" disabled={quantity === 0}>
                        ADD
                    </button>
                </div>
            </div>
            <img src={item.productImg} alt={item.productTitle} className="item-image" />
        </div>
    );
};

const RecommendedItems = ({ items, addToCart }) => {
    return (
        <div className="recommended-items">
            <h2>Recommended Items</h2>
            {items.map(item => (
                <MenuItem key={item.id} item={item} addToCart={addToCart} />
            ))}
        </div>
    );
};

export default RecommendedItems;