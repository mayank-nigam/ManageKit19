import React from 'react';
import { RefreshCw } from 'lucide-react';
import './Loader.css';

/**
 * Optimized Lightweight Loader Component
 * Replaces heavy SVG animations with Lucide's RefreshCw for better performance
 */
const Loader = ({ message = 'Loading...', size = 'medium', inline = false }) => {
    const sizeClasses = {
        small: 'w-5 h-5',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    if (inline) {
        return (
            <div className="loader-container">
                <RefreshCw 
                    className={`loader-spinner ${sizeClasses[size] || 'medium'}`} 
                />
                {message && <p className="loader-message">{message}</p>}
            </div>
        );
    }

    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <RefreshCw 
                    className={`loader-spinner ${sizeClasses[size] || 'medium'}`} 
                />
                {message && <p className="loader-message">{message}</p>}
            </div>
        </div>
    );
};

export default Loader;

