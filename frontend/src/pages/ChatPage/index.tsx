import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { TelegramDrawer } from './TelegramDrawer';
import { ChatSidebar } from './ChatSidebar';
import { ChatMain } from './ChatMain';
import { CreateGroupModal, ManageGroupModal } from './GroupModals';
import '../../styles/ChatPageStyles/chat-layout.css';

export const ChatPage = () => {
    const socket = useSocket();
    const { user, logout } = useAuth();
    
    const [chats, setChats] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        api.get('/api/chat/my-chats').then(res => setChats(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (isSearching && contacts.length === 0) {
            api.get('/api/auth/users').then(res => setContacts(res.data)).catch(console.error);
        }
    }, [isSearching, contacts.length]);

    useEffect(() => {
        if (activeChat) {
            api.get(`/api/chat/${activeChat.id}/messages`)
               .then(res => setMessages(res.data))
               .catch(console.error);
            
            if (socket) {
                socket.emit('join_chat', { chat_id: activeChat.id });
            }
        }
    }, [activeChat, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: any) => {
            if (activeChat && Number(msg.chat_id) === Number(activeChat.id)) {
                setMessages((prev: any[]) => [...prev, msg]);
            }
        };

        const handleStatusChange = (data: { user_id: number, status: string }) => {
            setContacts((prev: any[]) => prev.map((c: any) => 
                c.id === data.user_id ? { ...c, status: data.status } : c
            ));
            setChats((prev: any[]) => prev.map((chat: any) => {
                if (chat.type === 'private' && chat.target_id === data.user_id) {
                    return { ...chat, status: data.status };
                }
                return chat;
            }));
            setActiveChat((currentActive: any) => {
                if (currentActive && currentActive.target_id === data.user_id) {
                    return { ...currentActive, status: data.status };
                }
                return currentActive;
            });
        };

        const handleMessageEdited = (data: any) => {
            if (activeChat && Number(data.chat_id) === Number(activeChat.id)) {
                setMessages((prev: any[]) => prev.map((m: any) => 
                    m.id === data.message_id ? { ...m, content: data.content, is_edited: true } : m
                ));
            }
        };

        const handleMessageDeleted = (data: any) => {
            if (activeChat && Number(data.chat_id) === Number(activeChat.id)) {
                setMessages((prev: any[]) => prev.filter((m: any) => m.id !== data.message_id));
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_status', handleStatusChange);
        socket.on('message_edited', handleMessageEdited);
        socket.on('message_deleted', handleMessageDeleted);

        return () => { 
            socket.off('new_message', handleNewMessage); 
            socket.off('user_status', handleStatusChange);
            socket.off('message_edited', handleMessageEdited);
            socket.off('message_deleted', handleMessageDeleted);
        };
    }, [socket, activeChat]);

    const startPrivateChat = async (targetUser: any) => {
        try {
            const res = await api.post('/api/chat/private', { target_id: targetUser.id });
            const chatData = res.data;
            chatData.title = targetUser.full_name;
            chatData.target_id = targetUser.id;
            chatData.status = targetUser.status;
            
            if (!chats.find(c => c.id === chatData.id)) {
                setChats((prev: any[]) => [chatData, ...prev]);
            }
            
            setActiveChat(chatData);
            setSearchQuery('');
            setIsSearching(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="chat-layout">
            <TelegramDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} user={user} logout={logout} />
            
            {isCreateGroupOpen && (
                <CreateGroupModal 
                    contacts={contacts} 
                    onClose={() => setIsCreateGroupOpen(false)} 
                    onSuccess={(newChat: any) => {
                        setChats(prev => [newChat, ...prev]);
                        setActiveChat(newChat);
                    }} 
                />
            )}

            {isManageGroupOpen && activeChat && (
                <ManageGroupModal
                    chat={activeChat}
                    contacts={contacts}
                    currentUser={user}
                    onClose={() => setIsManageGroupOpen(false)}
                    onUpdateChat={(updatedChat: any) => {
                        setActiveChat(updatedChat);
                        setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
                    }}
                />
            )}

            <ChatSidebar 
                onOpenDrawer={() => setIsDrawerOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                contacts={contacts}
                chats={chats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                startPrivateChat={startPrivateChat}
                onOpenCreateGroup={() => {
                    if (contacts.length === 0) {
                        api.get('/api/auth/users').then(res => setContacts(res.data));
                    }
                    setIsCreateGroupOpen(true);
                }}
            />
            <ChatMain 
                activeChat={activeChat}
                messages={messages}
                user={user}
                messagesEndRef={messagesEndRef}
                onOpenManageGroup={() => setIsManageGroupOpen(true)}
            />
        </div>
    );
};