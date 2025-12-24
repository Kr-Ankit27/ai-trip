import React, { useState, useEffect } from 'react';
import { HistorySec, PhraseJournal, FactCards } from './culture';

export default function CultureHub({ trip }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const destination = trip?.userSelection?.location || trip?.tripData?.location || "Destination";

    useEffect(() => {
        const fetchCultureData = async () => {
            setLoading(true);
            try {
                const { chat } = await import('../../service/AIModel');
                const prompt = `Generate a travel guide for ${destination} in JSON format. 
        Important: Use the official local language of ${destination} for translations.
        
        Include:
        1. "phrases": An array of 12 objects with {phrase: string, translation: string, meaning: string} (phrase is English, translation is the LOCAL language version, meaning is the context).
        2. "history": A short, engaging 2-3 sentence overview of the city's history.
        3. "facts": An array of 3 unique, surprising "Did you know?" fun facts (return as an array of SIMPLE STRINGS).
        
        Return ONLY the raw JSON.`;

                const responseText = await chat([], prompt);
                const parsedData = JSON.parse(responseText);

                // Safety check for facts structure
                if (parsedData.facts) {
                    parsedData.facts = parsedData.facts.map(f => typeof f === 'object' ? (f.fact || f.content || JSON.stringify(f)) : f);
                }

                setData(parsedData);
            } catch (err) {
                console.error("Culture Hub AI Error:", err);
                setData({
                    phrases: Array(12).fill({ phrase: "Hello", translation: "Salam", meaning: "Greeting" }),
                    history: "A city where ancient traditions meet futuristic dreams.",
                    facts: ["Home to the world's tallest building.", "Known for its vibrant spice souks."]
                });
            } finally {
                setLoading(false);
            }
        };

        if (destination) {
            fetchCultureData();
        }
    }, [destination]);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-black text-xs uppercase tracking-[0.2em] animate-pulse">Dusting off the old journals...</p>
            </div>
        );
    }

    const totalSpreads = data ? Math.ceil(data.phrases.length / 4) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 space-y-16">
            <HistorySec destination={destination} history={data?.history} />

            <PhraseJournal
                phrases={data?.phrases}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalSpreads={totalSpreads}
                destination={destination}
                copyToClipboard={copyToClipboard}
                copiedIndex={copiedIndex}
            />

            <FactCards facts={data?.facts} />
        </div>
    );
}
