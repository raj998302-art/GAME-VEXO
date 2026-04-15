import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, doc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MessageCircle, Send, User } from 'lucide-react';

export default function SupportChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'supportChats'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by updatedAt descending
      chatsData.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setChats(chatsData);
    });
    return () => unsubscribe();
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId || !activeChat) return;

    const newMessage = {
      sender: 'admin',
      text: message,
      timestamp: new Date().toISOString()
    };

    try {
      const chatRef = doc(db, 'supportChats', activeChatId);
      const newMessages = [...(activeChat.messages || []), newMessage];
      await setDoc(chatRef, {
        messages: newMessages,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Chat List */}
      <div className="w-1/3 bg-card-bg border border-border-color rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border-color bg-bg-dark">
          <h2 className="font-bold text-text-main flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-color" />
            Support Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-text-dim">No active chats.</div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left p-4 border-b border-border-color hover:bg-white/5 transition-colors flex items-center gap-3 ${activeChatId === chat.id ? 'bg-white/10' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-main truncate">{chat.userName || 'Unknown User'}</h4>
                  <p className="text-sm text-text-dim truncate">
                    {chat.messages && chat.messages.length > 0 
                      ? chat.messages[chat.messages.length - 1].text 
                      : 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-card-bg border border-border-color rounded-2xl overflow-hidden flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-border-color bg-bg-dark">
              <h3 className="font-bold text-text-main">{activeChat.userName || 'Unknown User'}</h3>
              <p className="text-xs text-text-dim">ID: {activeChat.userId}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(!activeChat.messages || activeChat.messages.length === 0) ? (
                <div className="text-center text-text-dim mt-10">No messages in this chat.</div>
              ) : (
                activeChat.messages.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'admin' ? 'bg-primary-color text-white rounded-tr-sm' : 'bg-white/10 text-text-main rounded-tl-sm'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border-color bg-bg-dark flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-card-bg border border-border-color rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary-color"
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                className="px-6 py-3 bg-primary-color text-white rounded-xl font-semibold hover:bg-primary-color/90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-dim">
            Select a chat to view messages.
          </div>
        )}
      </div>
    </div>
  );
}
