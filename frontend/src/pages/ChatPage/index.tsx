import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { TelegramDrawer } from './TelegramDrawer';
import { ChatSidebar } from './ChatSidebar';
import { ChatMain } from './ChatMain';

import '../../styles/ChatPageStyles/chat-layout.css';

export const ChatPage = () => {
    const socket = useSocket();
    const { user, logout } = useAuth();
    
    const [chats, setChats] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
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
        }
    }, [activeChat]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: any) => {
            if (activeChat && msg.chat_id === activeChat.id) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('new_message', handleNewMessage);
        return () => { socket.off('new_message', handleNewMessage); };
    }, [socket, activeChat]);

    const startPrivateChat = async (targetUser: any) => {
        try {
            const res = await api.post('/api/chat/private', { target_id: targetUser.id });
            const chatData = res.data;
            chatData.title = targetUser.full_name; 
            
            if (!chats.find(c => c.id === chatData.id)) {
                setChats(prev => [chatData, ...prev]);
            }
            
            setActiveChat(chatData);
            setSearchQuery('');
            setIsSearching(false);
        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (socket && activeChat && input.trim()) {
            socket.emit('send_message', {
                chat_id: activeChat.id,
                content: input
            });
            setInput('');
        }
    };

    return (
        <div className="chat-layout">
            <TelegramDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                user={user} 
                logout={logout} 
            />
            
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
            />

            <ChatMain 
                activeChat={activeChat}
                messages={messages}
                user={user}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
            />
        </div>
    );
};