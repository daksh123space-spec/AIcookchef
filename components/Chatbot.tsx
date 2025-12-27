
import React, { useState, useRef, useEffect } from 'react';
import { createKitchenChat } from '../services/geminiService';
import { Message } from '../types';
import { Chat } from '@google/genai';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your AI Sous Chef. How can I help you in the kitchen today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!chatRef.current) {
      chatRef.current = createKitchenChat();
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userMsg });
      let modelText = '';
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        modelText += chunk.text;
        setMessages(prev => {
          const last = [...prev];
          last[last.length - 1] = { role: 'model', text: modelText };
          return last;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an issue. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-orange-600 text-white rounded-full shadow-2xl hover:bg-orange-700 transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 bg-stone-900 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Chef Assistant
            </h3>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 h-[400px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-stone-50"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-orange-600 text-white rounded-tr-none' 
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'
                }`}>
                  {m.text || (isLoading && i === messages.length - 1 ? 'Thinking...' : '')}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-stone-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Chef anything..."
                className="w-full pl-4 pr-12 py-2 bg-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-1 bottom-1 px-3 bg-stone-900 text-white rounded-lg disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
