import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function FactCards({ facts }) {
    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center gap-4 justify-center">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Secret Vault</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {facts?.map((fact, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        key={i}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative group hover:bg-white/10 transition-all overflow-hidden"
                    >
                        <div className="text-5xl font-black text-emerald-400/10 absolute -top-4 -right-4 italic tracking-tighter">0{i + 1}</div>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed relative z-10 group-hover:text-white transition-colors">
                            {fact}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
