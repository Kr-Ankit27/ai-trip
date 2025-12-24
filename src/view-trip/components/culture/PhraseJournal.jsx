import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Copy } from 'lucide-react';

export default function PhraseJournal({
    phrases,
    currentPage,
    setCurrentPage,
    totalSpreads,
    destination,
    copyToClipboard,
    copiedIndex
}) {
    const currentPhrases = phrases?.slice(currentPage * 4, (currentPage * 4) + 4) || [];
    const leftPagePhrases = currentPhrases.slice(0, 2);
    const rightPagePhrases = currentPhrases.slice(2, 4);

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/20 rounded-2xl">
                        <BookOpen className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Discovery Journal</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Spread {currentPage + 1} of {totalSpreads}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 disabled:opacity-20 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1.5 px-3">
                        {[...Array(totalSpreads)].map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentPage === i ? 'bg-rose-500 w-4' : 'bg-white/20'}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalSpreads - 1, prev + 1))}
                        disabled={currentPage === totalSpreads - 1}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 disabled:opacity-20 transition-all active:scale-95"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="relative max-w-6xl mx-auto min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, rotateY: 10, scale: 0.95 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateY: -10, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "anticipate" }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative preserve-3d"
                    >
                        {/* Spine */}
                        <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent z-20 hidden lg:block" />

                        {/* Left Page */}
                        <PageContent
                            side="left"
                            phrases={leftPagePhrases}
                            destination={destination}
                            pageNum={currentPage * 2 + 1}
                            copyToClipboard={copyToClipboard}
                            copiedIndex={copiedIndex}
                        />

                        {/* Right Page */}
                        <PageContent
                            side="right"
                            phrases={rightPagePhrases}
                            destination="Discovery Series"
                            pageNum={currentPage * 2 + 2}
                            copyToClipboard={copyToClipboard}
                            copiedIndex={copiedIndex}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function PageContent({ side, phrases, destination, pageNum, copyToClipboard, copiedIndex }) {
    const isLeft = side === 'left';
    return (
        <div className={`p-10 lg:p-16 ${isLeft ? 'border-b lg:border-b-0 lg:border-r border-white/10' : 'bg-white/[0.01]'} space-y-12 relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b${isLeft ? 'r' : 'l'} from-white/[0.02] to-transparent pointer-events-none`} />
            <div className="flex items-center justify-between mb-8 opacity-30">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{isLeft ? `Vol. I - ${destination}` : destination}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Page {pageNum}</span>
            </div>

            <div className="space-y-12 relative z-10">
                {phrases.map((item, i) => (
                    <div key={i} className="group relative">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" /> {item.meaning}
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-rose-400 transition-colors uppercase leading-tight">{item.translation}</h3>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest italic opacity-60">"{item.phrase}"</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(item.translation, `${isLeft ? 'l' : 'r'}-${i}`)}
                                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all transform group-hover:scale-110 shadow-xl"
                            >
                                {copiedIndex === `${isLeft ? 'l' : 'r'}-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
