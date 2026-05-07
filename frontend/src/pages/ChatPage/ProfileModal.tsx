import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export const ProfileModal = ({ isOpen, onClose }: any) => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        middle_name: user?.middle_name || '',
        position: user?.position || '',
        avatar_url: user?.avatar_url || ''
    });

    if (!isOpen) return null;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        const toastId = toast.loading('Загрузка фото...');
        try {
            const res = await api.post('/api/files/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const newAvatarUrl = `/api/files/download/${res.data.file_id}`;
            
            setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
            toast.success('Фото загружено', { id: toastId });
        } catch {
            toast.error('Ошибка загрузки', { id: toastId });
        }
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/api/auth/me', formData);
            updateUser(res.data);
            toast.success('Профиль сохранен');
            onClose();
        } catch {
            toast.error('Ошибка сохранения');
        }
    };

    const getAvatarSrc = () => {
        if (!formData.avatar_url) return null;
        const token = localStorage.getItem('token');
        return `${formData.avatar_url}?jwt=${token}`;
    };

    return (
        <div className="group-modal-overlay" onClick={onClose}>
            <div className="group-modal-content" style={{maxWidth: '350px'}} onClick={e => e.stopPropagation()}>
                <div className="group-modal-header">
                    <span>Настройки профиля</span>
                    <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>✖</button>
                </div>
                <div className="group-modal-body">
                    <div className="avatar-upload-container" onClick={() => fileInputRef.current?.click()}>
                        {formData.avatar_url ? (
                            <img src={getAvatarSrc() as string} alt="avatar" className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder">{formData.first_name?.[0] || 'U'}</div>
                        )}
                        <div className="avatar-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/png, image/jpeg, image/jpg" onChange={handleAvatarChange} />
                    
                    <label className="drawer-form-label">Фамилия</label>
                    <input className="group-input" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                    
                    <label className="drawer-form-label">Имя</label>
                    <input className="group-input" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                    
                    <label className="drawer-form-label">Отчество</label>
                    <input className="group-input" value={formData.middle_name} onChange={e => setFormData({...formData, middle_name: e.target.value})} />
                    
                    <label className="drawer-form-label">Должность</label>
                    <input className="group-input" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
                <div className="group-modal-footer">
                    <button className="btn-primary" style={{width: '100%'}} onClick={handleSave}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};