import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import DestinationCard from './components/DestinationCard';
import { suggestDestinations } from '../service/AIModel';
import { fetchImageFor } from '../lib/utils';

export default function DestinationResults({ preferences }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await suggestDestinations(preferences);

            // Fetch images for each destination
            const withImages = await Promise.all(
                results.map(async (dest) => {
                    const cityName = dest.destination.split(',')[0].trim();
                    const imageUrl = await fetchImageFor(`${cityName} travel destination skyline`);
                    return { ...dest, imageUrl };
                })
            );

            setDestinations(withImages);
        } catch (err) {
            console.error('Error fetching destinations:', err);
            setError('Failed to load destinations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDestination = (destination) => {
        navigate(`/create-trip?destination=${encodeURIComponent(destination)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-black mb-2">Finding Your Perfect Matches...</h2>
                    <p className="text-slate-400 font-medium">Our AI is analyzing thousands of destinations</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">😔</span>
                    </div>
                    <h2 className="text-2xl font-black mb-4">Oops! Something went wrong</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <button
                        onClick={fetchDestinations}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-black flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Recommendations</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Your <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Perfect Matches</span>
                    </h1>
                    <p className="text-slate-400 text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Based on your style, we've curated {destinations.length} incredible places that you'll love.
                    </p>
                </motion.div>

                {/* Destination Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {destinations.map((dest, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <DestinationCard
                                destination={dest.destination}
                                matchScore={dest.matchScore}
                                reason={dest.reason}
                                bestMonths={dest.bestMonths}
                                highlightActivity={dest.highlightActivity}
                                imageUrl={dest.imageUrl}
                                onSelect={() => handleSelectDestination(dest.destination)}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold flex items-center gap-3 transition-all hover:scale-105"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Restart Quiz
                    </button>
                    <button
                        onClick={() => navigate('/create-trip')}
                        className="px-8 py-4 bg-white text-slate-900 hover:bg-emerald-50 rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-white/10 flex items-center gap-3"
                    >
                        Enter Destination Manually
                    </button>
                </div>
            </div>
        </div>
    );
}
