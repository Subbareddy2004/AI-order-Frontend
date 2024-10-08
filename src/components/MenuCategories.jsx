import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchMenuCategories } from '../services/firebaseOperations';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MenuCategories = () => {
    const [categories, setCategories] = useState([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadCategories = async () => {
            const categoriesData = await fetchMenuCategories();
            setCategories(categoriesData);
        };
        loadCategories();
    }, []);

    const scroll = (direction) => {
        const container = containerRef.current;
        if (container) {
            const scrollAmount = direction === 'left' ? -container.offsetWidth : container.offsetWidth;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setScrollPosition(container.scrollLeft + scrollAmount);
        }
    };

    return (
        <div className="mb-8 relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">What's on your mind?</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => scroll('left')} 
                        className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition-colors"
                        disabled={scrollPosition <= 0}
                    >
                        <FaChevronLeft className="text-gray-600" />
                    </button>
                    <button 
                        onClick={() => scroll('right')} 
                        className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition-colors"
                        disabled={scrollPosition >= (categories.length - 7) * 120} // Assuming each item is 120px wide
                    >
                        <FaChevronRight className="text-gray-600" />
                    </button>
                </div>
            </div>
            <div 
                ref={containerRef}
                className="flex overflow-x-hidden pb-4 space-x-4 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {categories.map((category) => (
                    <Link 
                        to={`/category/${encodeURIComponent(category.name)}`} 
                        key={category.name} 
                        className="flex flex-col items-center flex-shrink-0" 
                        style={{ width: '120px' }}
                    >
                        <img src={category.imageUrl} alt={category.name} className="w-24 h-24 object-cover rounded-full mb-2" />
                        <span className="text-sm text-center">{category.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MenuCategories;