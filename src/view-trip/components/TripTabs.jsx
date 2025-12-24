import React from 'react';
import { motion } from 'framer-motion';
import { ListOrdered, Sparkles, BookOpen } from 'lucide-react';

export default function TripTabs({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'itinerary', label: 'Itinerary', icon: ListOrdered, color: 'from-blue-500 to-indigo-600' },
        { id: 'guide', label: 'Local Guide', icon: BookOpen, color: 'from-rose-500 to-orange-600' },
        { id: 'hub', label: 'Trip Hub', icon: Sparkles, color: 'from-emerald-500 to-teal-600' },
    ];

    return (
        <div className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-500 group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl shadow-xl`}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className="relative z-10 flex items-center gap-3 text-xs font-black uppercase tracking-[0.15em]">
                                <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
