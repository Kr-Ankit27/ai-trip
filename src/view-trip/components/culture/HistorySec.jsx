import React from 'react';
import { motion } from 'framer-motion';
import { History, Quote } from 'lucide-react';

export default function HistorySec({ destination, history }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group h-full"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-rose-600/20 rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 md:p-16 overflow-hidden">
                <Quote className="absolute -top-6 -right-6 w-48 h-48 text-white/5 rotate-12" />
                <div className="max-w-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <History className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">The Chronology</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8 tracking-tighter">
                        Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{destination}</span>
                    </h1>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-2xl italic border-l-4 border-indigo-500/30 pl-8">
                        "{history}"
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
