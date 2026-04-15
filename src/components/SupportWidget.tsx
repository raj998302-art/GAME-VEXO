import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function SupportWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const chatId = user.uid; // One chat per user
    const chatRef = doc(db, 'supportChats', chatId);
    
    // Ensure chat document exists
    getDoc(chatRef).then((docSnap) => {
      if (!docSnap.exists()) {
        setDoc(chatRef, {
          userId: user.uid,
          userName: user.displayName || 'User',
          messages: [],
          updatedAt: serverTimestamp()
        });
      }
    });

    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const newMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    try {
      const chatRef = doc(db, 'supportChats', user.uid);
      const newMessages = [...messages, newMessage];
      await setDoc(chatRef, {
        userId: user.uid,
        userName: user.displayName || 'User',
        messages: newMessages,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-color text-white rounded-full flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)] hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-card-bg border border-border-color rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="p-4 bg-bg-dark border-b border-border-color flex items-center justify-between">
            <h3 className="font-bold text-text-main flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-color" />
              Support Chat
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-text-dim hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-text-dim mt-10">
                <p>How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-color text-white rounded-tr-sm' : 'bg-white/10 text-text-main rounded-tl-sm'}`}>
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
              placeholder="Type your message..."
              className="flex-1 bg-card-bg border border-border-color rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary-color"
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className="p-2 bg-primary-color text-white rounded-xl hover:bg-primary-color/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
