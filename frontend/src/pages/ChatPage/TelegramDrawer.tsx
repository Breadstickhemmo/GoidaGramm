import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../../styles/ChatPageStyles/telegram-drawer.css';

interface TelegramDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    logout: () => void;
}

export const TelegramDrawer: React.FC<TelegramDrawerProps> = ({ isOpen, onClose, user, logout }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`telegram-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <div className="drawer-avatar">
                        {user?.first_name?.[0] || 'U'}
                    </div>
                    <div className="drawer-user-info">
                        <h3>{user?.full_name}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>
                <div className="drawer-menu">
                    <div className="drawer-menu-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Мой профиль
                    </div>
                    {user?.role === 'Admin' && (
                        <div className="drawer-menu-item" onClick={() => navigate('/admin')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            Панель администратора
                        </div>
                    )}
                    <div className="drawer-menu-item" onClick={logout}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Выйти
                    </div>
                </div>
            </div>
        </>
    );
};