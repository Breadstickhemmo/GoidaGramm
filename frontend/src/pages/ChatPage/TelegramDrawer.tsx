import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ChatPageStyles/telegram-drawer.css';

interface TelegramDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    logout: () => void;
    onOpenProfile: () => void;
}

export const TelegramDrawer: React.FC<TelegramDrawerProps> = ({ isOpen, onClose, user, logout, onOpenProfile }) => {
    const navigate = useNavigate();

    const getAvatarSrc = () => {
        if (!user?.avatar_url) return null;
        const token = localStorage.getItem('token');
        return `${user.avatar_url}?jwt=${token}`;
    };

    return (
        <>
            <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`telegram-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <div className="drawer-avatar" style={{overflow: 'hidden'}}>
                        {user?.avatar_url ? (
                            <img src={getAvatarSrc() as string} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                            user?.first_name?.[0] || 'U'
                        )}
                    </div>
                    <div className="drawer-user-info">
                        <h3>{user?.full_name}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>
                <div className="drawer-menu">
                    <div className="drawer-menu-item" onClick={() => { onClose(); onOpenProfile(); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Настройки профиля
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