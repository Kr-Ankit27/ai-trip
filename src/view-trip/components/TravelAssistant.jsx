import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Compass } from 'lucide-react';
import { chat } from '../../service/AIModel';

export default function TravelAssistant({ trip }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'model',
            parts: [{ text: "Hi! I'm your Travel Assistant. 🏜️ I know everything about your trip to " + (trip?.userSelection?.location || "this destination") + ". How can I help you today?" }]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const generateContextPrompt = () => {
        const tripData = trip?.tripData || trip || {};
        const itinerary = tripData?.itinerary || [];
        const hotels = tripData?.hotel_options || [];
        const location = trip?.userSelection?.location || "this destination";

        let context = `Context: User is on a trip to ${location}.
Hotels: ${hotels.map(h => h.name).join(', ')}.
Itinerary Highlights:
`;
        itinerary.forEach(day => {
            context += `Day ${day.day}: ${day.plan.map(p => p.activity).join(', ')}\n`;
        });

        context += `\nYou are a helpful travel assistant. Keep responses brief, friendly, and trip-focused. Use emojis.`;
        return context;
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', parts: [{ text: userMsg }] }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Prime with context if it's the first real question
            const historyWithContext = [
                { role: 'user', parts: [{ text: generateContextPrompt() }] },
                { role: 'model', parts: [{ text: "Understood! I'm ready to help with your trip details." }] },
                ...newMessages
            ];

            const response = await chat(historyWithContext, "Respond to the user's last message based on the context provided earlier.");

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response }]
            }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Sorry, I ran into a bit of trouble. Please try again in a moment! 🏜️" }]
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Travel AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
                        >
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/10'
                                            }`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Compass className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                                                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                            }`}>
                                            {msg.parts[0].text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="p-4 rounded-3xl rounded-tl-none bg-white/5 border border-white/10 text-slate-400 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-slate-900/50 border-t border-white/10">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything about your trip..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-center text-[9px] text-slate-600 mt-3 font-bold uppercase tracking-tighter">
                                AI can make mistakes. Verify important info.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen
                        ? 'bg-slate-800 text-white border border-white/10'
                        : 'bg-blue-600 text-white shadow-blue-600/30'
                    }`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
