import React, { useState } from 'react';
import './DeleteButton.css';

export default function DeleteButton({ onDelete, label = 'Delete Item', style = {} }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isDeleting) {
            setIsDeleting(true);
            setTimeout(() => {
                setIsDeleting(false);
                if (onDelete) {
                    onDelete();
                }
            }, 3200);
        }
    };

    return (
        <button 
            className={`delete-button ${isDeleting ? 'delete' : ''}`} 
            onClick={handleClick}
            style={style}
        >
            <div className="trash">
                <div className="top">
                    <div className="paper"></div>
                </div>
                <div className="box"></div>
                <div className="check">
                    <svg viewBox="0 0 8 6">
                        <polyline points="1 3.4 2.71428571 5 7 1"></polyline>
                    </svg>
                </div>
            </div>
            <span>{label}</span>
        </button>
    );
}
