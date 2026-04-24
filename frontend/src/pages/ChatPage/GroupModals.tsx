import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export const CreateGroupModal = ({ onClose, contacts, onSuccess }: any) => {
    const [title, setTitle] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const toggleUser = (id: number) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
    };

    const handleCreate = async () => {
        if (!title.trim()) return toast.error('Введите название группы');
        if (selectedUsers.length === 0) return toast.error('Выберите хотя бы одного участника');

        try {
            const res = await api.post('/api/chat/group', { title, user_ids: selectedUsers });
            toast.success('Группа создана!');
            onSuccess(res.data);
            onClose();
        } catch (err) {
            toast.error('Ошибка при создании группы');
        }
    };

    return (
        <div className="group-modal-overlay" onClick={onClose}>
            <div className="group-modal-content" onClick={e => e.stopPropagation()}>
                <div className="group-modal-header">
                    <span>Новая группа</span>
                    <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>✖</button>
                </div>
                <div className="group-modal-body">
                    <input 
                        className="group-input" placeholder="Название группы" 
                        value={title} onChange={e => setTitle(e.target.value)} 
                    />
                    <div style={{fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem'}}>Выберите участников:</div>
                    {contacts.map((c: any) => (
                        <label key={c.id} className="contact-select-item" style={{cursor: 'pointer'}}>
                            <input type="checkbox" checked={selectedUsers.includes(c.id)} onChange={() => toggleUser(c.id)} />
                            <div className="avatar blue" style={{width: '32px', height: '32px', fontSize: '0.9rem'}}>{c.first_name[0]}</div>
                            <span>{c.full_name}</span>
                        </label>
                    ))}
                </div>
                <div className="group-modal-footer">
                    <button className="btn-primary" onClick={handleCreate}>Создать</button>
                </div>
            </div>
        </div>
    );
};

export const ManageGroupModal = ({ chat, onClose, contacts, currentUser, onUpdateChat }: any) => {
    const [members, setMembers] = useState<any[]>([]);
    const [newTitle, setNewTitle] = useState(chat.title || '');
    const [userToAdd, setUserToAdd] = useState('');
    const isCreator = chat.creator_id === currentUser.id;

    useEffect(() => {
        api.get(`/api/chat/${chat.id}/members`).then(res => setMembers(res.data));
    }, [chat.id]);

    const handleRename = async () => {
        if (!newTitle.trim() || newTitle === chat.title) return;
        try {
            await api.put(`/api/chat/group/${chat.id}/title`, { title: newTitle });
            toast.success('Название изменено');
            onUpdateChat({ ...chat, title: newTitle });
        } catch { toast.error('Ошибка изменения'); }
    };

    const handleRemove = async (userId: number) => {
        try {
            await api.delete(`/api/chat/group/${chat.id}/members/${userId}`);
            setMembers(prev => prev.filter(m => m.id !== userId));
            toast.success('Участник удален');
        } catch { toast.error('Ошибка'); }
    };

    const handleAdd = async () => {
        if (!userToAdd) return;
        try {
            await api.post(`/api/chat/group/${chat.id}/members`, { user_id: Number(userToAdd) });
            toast.success('Участник добавлен');
            api.get(`/api/chat/${chat.id}/members`).then(res => setMembers(res.data));
            setUserToAdd('');
        } catch { toast.error('Ошибка добавления'); }
    };

    const availableContacts = contacts.filter((c: any) => !members.find(m => m.id === c.id));

    return (
        <div className="group-modal-overlay" onClick={onClose}>
            <div className="group-modal-content" onClick={e => e.stopPropagation()}>
                <div className="group-modal-header">
                    <span>Настройки: {chat.title}</span>
                    <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>✖</button>
                </div>
                <div className="group-modal-body">
                    {isCreator && (
                        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                            <input className="group-input" style={{margin: 0}} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            <button className="btn-primary" onClick={handleRename}>Сохранить</button>
                        </div>
                    )}
                    
                    <div style={{fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem'}}>Участники ({members.length}):</div>
                    <div style={{marginBottom: '20px'}}>
                        {members.map(m => (
                            <div key={m.id} className="contact-select-item">
                                <div className="avatar blue" style={{width: '32px', height: '32px', fontSize: '0.9rem'}}>{m.full_name[0]}</div>
                                <span>{m.full_name} {m.id === chat.creator_id ? '👑' : ''}</span>
                                {isCreator && m.id !== currentUser.id && (
                                    <button className="btn-danger-icon" onClick={() => handleRemove(m.id)}>❌</button>
                                )}
                            </div>
                        ))}
                    </div>

                    {isCreator && availableContacts.length > 0 && (
                        <div style={{display: 'flex', gap: '10px'}}>
                            <select className="group-input" style={{margin: 0}} value={userToAdd} onChange={e => setUserToAdd(e.target.value)}>
                                <option value="">Выберите сотрудника...</option>
                                {availableContacts.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                            </select>
                            <button className="btn-primary" onClick={handleAdd}>Добавить</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};