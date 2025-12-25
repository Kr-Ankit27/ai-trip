import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { DEFAULT_IMAGE } from '../../lib/utils';

export default function DestinationCard({ destination, matchScore, reason, bestMonths, highlightActivity, imageUrl, onSelect }) {
    const getMatchColor = (score) => {
        if (score >= 95) return 'from-emerald-500 to-green-500';
        if (score >= 85) return 'from-blue-500 to-indigo-500';
        return 'from-amber-500 to-orange-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl hover:border-white/30 hover:bg-white/10 transition-all duration-500 group"
        >
            {/* Image Section */}
            <div className="h-56 relative overflow-hidden">
                <img
                    src={imageUrl || DEFAULT_IMAGE}
                    alt={destination}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Match Score Badge */}
                <div className="absolute top-4 right-4">
                    <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getMatchColor(matchScore)} shadow-lg`}>
                        <span className="text-white font-black text-sm">{matchScore}% Match</span>
                    </div>
                </div>

                {/* Destination Name Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        Perfect For You
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                        {destination}
                    </h3>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
                {/* Why it matches */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Why This Destination</h4>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {reason}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Best Time</span>
                        </div>
                        <p className="text-sm font-bold text-white">{bestMonths}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Highlight</span>
                        </div>
                        <p className="text-sm font-bold text-white line-clamp-1">{highlightActivity}</p>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onSelect}
                    className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl text-white font-black tracking-tight transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group/btn"
                >
                    Plan This Trip
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
