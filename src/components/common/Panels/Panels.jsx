import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import UniversalDetailContent from './UniversalDetailContent';
import './Panels.css';

const Panels = ({
    isOpen,
    onClose,
    title = 'Page',
    children,
    width = '50%',
    className = '',
    actions,
    footer,
    hideHeader = false,
    hideFooter = false
}) => {
    // Prevent body scroll when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="universal-panel-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Side Panel */}
                    <motion.div
                        className={`universal-right-panel ${className}`}
                        style={{ width }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Panel Header */}
                        {!hideHeader && (
                            <div className="panel-header-v3">
                                <div className="header-left-v3">
                                    <button className="panel-back-link" onClick={onClose}>
                                        <ChevronLeft size={18} />
                                        <span>Back</span>
                                    </button>
                                </div>
                                <div className="header-right-v3">
                                    {actions}
                                </div>
                            </div>
                        )}

                        {/* Panel Content */}
                        <div className="panel-content-v3">
                            {children}
                        </div>

                        {/* Panel Footer */}
                        {!hideFooter && footer && (
                            <div className="panel-footer-v3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export const AppointmentTaskDetailPanel = ({
    isOpen,
    onClose,
    id,
    type,
    userId,
    onViewLead,
    onScorecardMouseEnter,
    onScorecardMouseLeave,
    detailData
}) => {
    return (
        <Panels
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'physical-appointment' ? 'Physical Appointment' : type === 'appointment' ? 'Appointment' : 'Task'}
            width="50%"
        >
            <UniversalDetailContent
                id={id}
                type={type}
                userId={userId}
                onViewLead={onViewLead}
                onScorecardMouseEnter={onScorecardMouseEnter}
                onScorecardMouseLeave={onScorecardMouseLeave}
                detailData={detailData}
            />
        </Panels>
    );
};

export default Panels;
