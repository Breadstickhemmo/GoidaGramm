import React from 'react';

import '../../styles/ChatPageStyles/chat-sidebar.css';

interface ChatSidebarProps {
    onOpenDrawer: () => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    isSearching: boolean;
    setIsSearching: (val: boolean) => void;
    contacts: any[];
    chats: any[];
    activeChat: any;
    setActiveChat: (chat: any) => void;
    startPrivateChat: (user: any) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    onOpenDrawer, searchQuery, setSearchQuery, isSearching, setIsSearching,
    contacts, chats, activeChat, setActiveChat, startPrivateChat
}) => {

    const filteredContacts = contacts.filter(c => 
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside className="chat-sidebar">
            <div className="sidebar-header">
                <button className="menu-btn" onClick={onOpenDrawer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                        placeholder="Поиск" 
                        value={searchQuery}
                        onFocus={() => setIsSearching(true)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {isSearching && (
                    <button className="menu-btn" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>
            
            <div className="chat-list">
                {isSearching ? (
                    filteredContacts.map(contact => (
                        <div key={contact.id} className="list-item" onClick={() => startPrivateChat(contact)}>
                            <div className="avatar blue">{contact.first_name[0]}</div>
                            <div className="item-info">
                                <div className="chat-name">{contact.full_name}</div>
                                <div className="chat-preview">{contact.position}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    chats.map(chat => (
                        <div 
                            key={chat.id} 
                            className={`list-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => setActiveChat(chat)}
                        >
                            <div className="avatar purple">{chat.title ? chat.title[0] : '#'}</div>
                            <div className="item-info">
                                <div className="chat-name">{chat.title || "Личный чат"}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};