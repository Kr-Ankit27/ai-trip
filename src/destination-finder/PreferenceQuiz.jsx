import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import QuestionCard from './components/QuestionCard';

const QUESTIONS = [
    {
        id: 'climate',
        question: "What's your ideal climate?",
        options: [
            { value: 'cold', icon: '❄️', label: 'Cold & Snowy', description: 'Mountains, winter wonderlands' },
            { value: 'mild', icon: '🌤️', label: 'Mild & Pleasant', description: 'Spring/fall weather' },
            { value: 'hot', icon: '☀️', label: 'Hot & Sunny', description: 'Beaches, tropical vibes' },
        ]
    },
    {
        id: 'vibe',
        question: "What's your travel vibe?",
        options: [
            { value: 'adventure', icon: '🏔️', label: 'Adventure & Thrill', description: 'Hiking, sports, adrenaline' },
            { value: 'relaxation', icon: '🏖️', label: 'Relaxation & Wellness', description: 'Spa, beach, peaceful' },
            { value: 'cultural', icon: '🏛️', label: 'Cultural & Historical', description: 'Museums, heritage, art' },
            { value: 'nightlife', icon: '🌃', label: 'Nightlife & Entertainment', description: 'Clubs, dining, shopping' },
            { value: 'nature', icon: '🌿', label: 'Nature & Wildlife', description: 'Parks, safari, outdoors' },
        ]
    },
    {
        id: 'budget',
        question: "What's your budget style?",
        options: [
            { value: 'luxury', icon: '💎', label: 'Luxury & Premium', description: '5-star hotels, fine dining' },
            { value: 'comfort', icon: '🏨', label: 'Comfort & Standard', description: 'Mid-range, balanced' },
            { value: 'budget', icon: '💰', label: 'Budget-Friendly', description: 'Backpacking, hostels' },
        ]
    },
    {
        id: 'pace',
        question: "What's your preferred pace?",
        options: [
            { value: 'fast', icon: '🚀', label: 'Fast-Paced', description: 'Packed itinerary, see everything' },
            { value: 'balanced', icon: '⚖️', label: 'Balanced Mix', description: 'Mix of activities and rest' },
            { value: 'slow', icon: '🚶', label: 'Slow & Immersive', description: 'Deep exploration, local life' },
        ]
    },
    {
        id: 'crowd',
        question: "How do you feel about crowds?",
        options: [
            { value: 'offbeat', icon: '🏝️', label: 'Off-the-Beaten-Path', description: 'Hidden gems, less touristy' },
            { value: 'popular', icon: '🌆', label: 'Popular Hotspots', description: 'Famous landmarks, tourist favorites' },
            { value: 'no-preference', icon: '🤷', label: 'No Preference', description: 'Open to anything' },
        ]
    },
];

export default function PreferenceQuiz({ onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [preferences, setPreferences] = useState({});

    const handleSelect = (questionId, value) => {
        setPreferences(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = () => {
        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            onComplete(preferences);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const currentQ = QUESTIONS[currentQuestion];
    const isAnswered = preferences[currentQ.id] !== undefined;
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden flex flex-col">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto w-full px-6 py-12 flex-grow flex flex-col justify-center">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Preference Matcher</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        Let's design your <span className="text-blue-500">ideal trip</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Tell us a bit about your style, and we'll find the destinations that fit you perfectly.
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-12 relative">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        <span>Start</span>
                        <span>Finish</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                        />
                    </div>
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{currentQ.question}</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {currentQ.options.map((option) => {
                                const isSelected = preferences[currentQ.id] === option.value;
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(currentQ.id, option.value)}
                                        className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 ${isSelected
                                                ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/40 transform scale-[1.02]'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                                        <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>{option.label}</h3>
                                        <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{option.description}</p>

                                        {isSelected && (
                                            <motion.div
                                                layoutId="check"
                                                className="absolute top-4 right-4 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-auto">
                    <button
                        onClick={handleBack}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-0"
                    >
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!isAnswered}
                        className="group flex items-center gap-2 px-8 py-3 bg-white text-slate-900 hover:bg-blue-50 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
                    >
                        {currentQuestion === QUESTIONS.length - 1 ? 'Reveal Destinations' : 'Next Question'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
