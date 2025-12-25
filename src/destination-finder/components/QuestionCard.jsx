import React from 'react';
import { motion } from 'framer-motion';

export default function QuestionCard({ icon, label, description, selected, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative p-6 rounded-[2rem] border-2 transition-all duration-300 text-left w-full
        ${selected
                    ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`text-4xl ${selected ? 'scale-110' : ''} transition-transform`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className={`text-lg font-black tracking-tight ${selected ? 'text-blue-400' : 'text-white'}`}>
                        {label}
                    </h4>
                    {description && (
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            {description}
                        </p>
                    )}
                </div>
                {selected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </motion.button>
    );
}
