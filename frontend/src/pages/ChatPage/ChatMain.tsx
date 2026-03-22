import React, { FormEvent } from 'react';

import '../../styles/ChatPageStyles/chat-main.css';

interface ChatMainProps {
    activeChat: any;
    messages: any[];
    user: any;
    input: string;
    setInput: (val: string) => void;
    sendMessage: (e: FormEvent) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>; 
}

export const ChatMain: React.FC<ChatMainProps> = ({
    activeChat, messages, user, input, setInput, sendMessage, messagesEndRef
}) => {
    
    if (!activeChat) {
        return (
            <main className="chat-main">
                <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'rgba(0,0,0,0.1)', padding: '5px 15px', borderRadius: '15px', color: '#fff'}}>
                        Выберите чат для начала общения
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="chat-main">
            <div className="chat-header">
                <div className="chat-name" style={{fontSize: '1.1rem'}}>{activeChat.title || "Чат"}</div>
            </div>

            <div className="messages-container">
                {messages.map((m, i) => {
                    const isMine = m.sender_id === user.id;
                    const time = new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    return (
                        <div key={i} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                            {m.content}
                            <span className="message-time">{time}</span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <button type="button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                <form style={{display: 'flex', flex: 1}} onSubmit={sendMessage}>
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder="Написать сообщение..." 
                    />
                    <button type="submit" className="btn-send">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </main>
    );
};