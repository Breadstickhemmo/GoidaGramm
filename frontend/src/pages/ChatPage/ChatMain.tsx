import React, { useState, FormEvent, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import '../../styles/ChatPageStyles/chat-main.css';

interface ChatMainProps {
    activeChat: any;
    messages: any[];
    user: any;
    messagesEndRef: React.RefObject<HTMLDivElement | null>; 
    onOpenManageGroup: () => void;
}

export const ChatMain: React.FC<ChatMainProps> = ({
    activeChat, messages, user, messagesEndRef, onOpenManageGroup
}) => {
    const socket = useSocket();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const currentToken = localStorage.getItem('token');
    
    const [input, setInput] = useState('');
    const [editingMsg, setEditingMsg] = useState<any>(null);

    useEffect(() => {
        setInput('');
        setEditingMsg(null);
    }, [activeChat]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            return toast.error("Файл слишком большой. Максимум 10 МБ.");
        }

        const formData = new FormData();
        formData.append('file', file);

        const loadingToast = toast.loading('Отправка файла...');
        
        try {
            const res = await api.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (socket && activeChat) {
                socket.emit('send_message', {
                    chat_id: activeChat.id,
                    content: `📎 Файл: ${res.data.filename}`,
                    file_id: res.data.file_id
                });
            }
            
            toast.success('Файл успешно отправлен', { id: loadingToast });
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            const msg = err.response?.data?.msg || 'Ошибка при загрузке файла';
            toast.error(msg, { id: loadingToast });
        }
    };

    const handleEditClick = (msg: any) => {
        setEditingMsg(msg);
        setInput(msg.content);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleDeleteClick = (msgId: string) => {
        if (window.confirm("Удалить сообщение?")) {
            socket?.emit('delete_message', { message_id: msgId });
        }
    };

    const cancelEdit = () => {
        setEditingMsg(null);
        setInput('');
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (editingMsg) {
            socket?.emit('edit_message', { message_id: editingMsg.id, content: input });
            setEditingMsg(null);
        } else {
            socket?.emit('send_message', { chat_id: activeChat.id, content: input });
        }
        setInput('');
    };

    if (!activeChat) {
        return (
            <main className="chat-main">
                <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'rgba(0,0,0,0.2)', padding: '8px 20px', borderRadius: '20px', color: '#666'}}>
                        Выберите чат для начала общения
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="chat-main">
            <div className="chat-header">
                <div className="item-info">
                    <div className="chat-name" style={{fontSize: '1.1rem', fontWeight: 700}}>
                        {activeChat.title || "Личный чат"}
                    </div>
                    <div className="chat-status" style={{fontSize: '0.85rem', color: activeChat.status === 'online' ? '#3390ec' : '#707579'}}>
                        {activeChat.type === 'group' ? 'Групповой чат' : (activeChat.status === 'online' ? 'в сети' : 'был(а) недавно')}
                    </div>
                </div>
                
                {activeChat.type === 'group' && (
                    <button className="menu-btn" title="Настройки группы" onClick={onOpenManageGroup} style={{marginLeft: 'auto'}}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>
                )}
            </div>

            <div className="messages-container">
                {messages.map((m, i) => {
                    const isMine = m.sender_id === user.id;
                    const time = new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    const isFile = !!m.file_id;
                    const showAvatar = !isMine && activeChat?.type === 'group';

                    const prevMsg = i > 0 ? messages[i - 1] : null;
                    const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
                    
                    const isFirstFromSender = !prevMsg || prevMsg.sender_id !== m.sender_id;
                    const isLastFromSender = !nextMsg || nextMsg.sender_id !== m.sender_id;

                    return (
                        <div key={i} className={`message-row ${isMine ? 'mine' : 'theirs'} ${isFirstFromSender ? 'mt-3' : 'mt-1'}`}>
                            {showAvatar && (
                                isLastFromSender ? (
                                    <div className="avatar blue message-avatar">
                                        {m.sender_name ? m.sender_name[0] : '?'}
                                    </div>
                                ) : (
                                    <div className="message-avatar-spacer"></div>
                                )
                            )}

                            <div className="message-bubble-wrapper">
                                {isMine && (
                                    <div className="message-actions">
                                        {!isFile && (
                                            <button className="action-btn" onClick={() => handleEditClick(m)} title="Редактировать">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                        )}
                                        <button className="action-btn delete" onClick={() => handleDeleteClick(m.id)} title="Удалить">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                )}
                                <div className={`message-bubble ${isMine ? 'mine' : 'theirs'} ${!isFirstFromSender ? 'grouped-top' : ''} ${!isLastFromSender ? 'grouped-bottom' : ''}`}>
                                    {showAvatar && isFirstFromSender && (
                                        <div className="message-sender-name">{m.sender_name}</div>
                                    )}
                                    
                                    {isFile ? (
                                        <a 
                                            href={`/api/files/download/${m.file_id}?jwt=${currentToken}`}
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="file-link"
                                            style={{ color: '#3390ec', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
                                        >
                                            <span>{m.content}</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </a>
                                    ) : (
                                        <div>{m.content}</div>
                                    )}
                                    
                                    <div className="message-time-container">
                                        {m.is_edited && <span className="message-edited-label">ред.</span>}
                                        <span className="message-time">{time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div>
                {editingMsg && (
                    <div className="edit-banner">
                        <div className="edit-banner-info">
                            <span className="edit-banner-title">Редактирование</span>
                            <span className="edit-banner-text">{editingMsg.content}</span>
                        </div>
                        <button className="cancel-edit-btn" onClick={cancelEdit}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                )}
                
                <div className="chat-input-area">
                    <button type="button" onClick={() => fileInputRef.current?.click()} title="Прикрепить файл">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{display: 'none'}} 
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.zip"
                    />

                    <form style={{display: 'flex', flex: 1}} onSubmit={handleSubmit}>
                        <input 
                            ref={inputRef}
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder={editingMsg ? "Введите новое сообщение..." : "Написать сообщение..."} 
                        />
                        <button type="submit" className="btn-send" disabled={!input.trim()}>
                            {editingMsg ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};