import React from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './Alert.css';

const Alert = ({ 
    type = 'success', 
    title = 'Success', 
    message = '', 
    confirmText = 'OK', 
    cancelText = 'Cancel', 
    onConfirm, 
    onCancel, 
    onClose,
    show = false 
}) => {
    if (!show) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        if (onClose) onClose();
        if (!onConfirm && !onClose && onCancel) onCancel();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        if (onClose) onClose();
    };

    return ReactDOM.createPortal(
        <div className="custom-alert-overlay">
            <div className="custom-alert-card">
                <div className={`custom-alert-icon ${type}`}>
                    {type === 'success' ? (
                        <CheckCircle size={48} strokeWidth={2.5} />
                    ) : (
                        <AlertCircle size={48} strokeWidth={2.5} />
                    )}
                </div>
                <div className="custom-alert-content">
                    <h3 className="custom-alert-title">{title}</h3>
                    <p className="custom-alert-message">{message}</p>
                </div>
                <div className="custom-alert-footer">
                    {type === 'confirm' && (
                        <button className="btn-cancel" onClick={handleCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button 
                        className={`btn-confirm ${type === 'success' ? 'btn-success' : 'btn-error'}`} 
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Alert;
