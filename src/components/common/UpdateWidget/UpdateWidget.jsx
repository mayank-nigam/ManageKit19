import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, Zap } from 'lucide-react';
import './UpdateWidget.css';

const UpdateWidget = ({ isOpen, onClose, hasUnreadUpdates, onMarkAsRead, updates = [], themeColor = '#ef4444' }) => {
    // We now receive updates as a prop from the parent which fetches them dynamically

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Invisible Backdrop to close on click outside */}
                    <div className="fixed inset-0 z-[10000]" onClick={onClose}></div>
                    
                    <motion.div 
                    className="update-modal"
                    style={{ '--update-theme-color': themeColor }}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="update-modal-header">
                            <div className="header-title">
                                <Sparkles size={20} className="header-icon-sparkle" />
                                <h2>What's New</h2>
                            </div>
                            <button className="close-btn" onClick={onClose} title="Close Updates">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="update-modal-content">
                            {hasUnreadUpdates && (
                                <div className="mark-read-container">
                                    <button className="mark-read-btn" onClick={onMarkAsRead}>
                                        <CheckCircle size={16} />
                                        Mark all as read
                                    </button>
                                </div>
                            )}

                            {updates.length === 0 ? (
                                <div className="no-updates">
                                    <Sparkles size={40} className="no-updates-icon" />
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="update-list">
                                    {updates.map((item, idx) => (
                                        <div key={item.UpdateId || idx} className={`update-item ${item.isNew && hasUnreadUpdates ? 'update-unread' : ''}`}>
                                            <div className="update-item-header">
                                                <div className="update-item-title">
                                                    <Zap size={18} className="update-zap-icon" />
                                                    <h3>{item.UpdateTitle || item.title}</h3>
                                                </div>
                                                <span className="update-date">{item.date || new Date(item.StartDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="update-item-body">
                                                <p>{item.UpdateDescription || item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default UpdateWidget;
