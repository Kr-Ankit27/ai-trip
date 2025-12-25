import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, Globe2, Compass } from 'lucide-react';

const TripSelection = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden flex items-center justify-center p-6">
            {/* --- Dynamic Background --- */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900" />

            {/* Animated Orbs */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"
            />

            <div className="relative z-10 max-w-5xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                        <Compass className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium tracking-wide text-blue-200">START YOUR JOURNEY</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                        How would you like to <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">explore the world?</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Choose your path. Let artificial intelligence guide you to new horizons, or take control and craft your masterpiece.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {/* Option 1: AI Discovery */}
                    <Link to="/destination-finder" className="group">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -10 }}
                            className="h-full relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] hover:border-blue-500/30"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                                <Sparkles className="w-32 h-32" />
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">Find a Destination</h3>
                            <p className="text-slate-400 mb-10 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                                Unsure where to go? Tell us your vibe, budget, and ideal experience. Our AI will curate personalized recommendations just for you.
                            </p>

                            <div className="flex items-center gap-3 text-white font-bold group-hover:gap-4 transition-all">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-white group-hover:to-white transition-all">Use AI Finder</span>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Option 2: Manual Creation */}
                    <Link to="/create-trip" className="group">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -10 }}
                            className="h-full relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)] hover:border-emerald-500/30"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
                                <Globe2 className="w-32 h-32" />
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                <MapPin className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-3xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">I Know My Destination</h3>
                            <p className="text-slate-400 mb-10 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                                Already have a dream spot in mind? Skip the search and jump straight into building your detailed day-by-day itinerary.
                            </p>

                            <div className="flex items-center gap-3 text-white font-bold group-hover:gap-4 transition-all">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:from-white group-hover:to-white transition-all">Build Itinerary</span>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TripSelection;
