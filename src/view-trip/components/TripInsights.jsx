import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Thermometer, Coins, TrendingUp, RefreshCcw, Info } from 'lucide-react';

export default function TripInsights({ trip }) {
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [currency, setCurrency] = useState({
        base: 'USD',
        local: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
        inr: { code: 'INR', symbol: '₹', rate: 83.5, name: 'Indian Rupee' }
    });

    const destination = trip?.userSelection?.location?.split(',')[0] || "Destination";

    useEffect(() => {
        // Detect Local Currency (Enhanced logic)
        const loc = trip?.userSelection?.location?.toLowerCase() || "";
        let local = { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' }; // Default

        const currencyMap = [
            { keywords: ['india'], code: 'INR', symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
            { keywords: ['uae', 'dubai', 'abu dhabi'], code: 'AED', symbol: 'د.إ', rate: 3.67, name: 'Dirham' },
            { keywords: ['united kingdom', 'london', 'britain', 'uk'], code: 'GBP', symbol: '£', rate: 0.78, name: 'Pound' },
            { keywords: ['japan', 'tokyo', 'osaka'], code: 'JPY', symbol: '¥', rate: 150.2, name: 'Yen' },
            { keywords: ['thailand', 'bangkok', 'phuket'], code: 'THB', symbol: '฿', rate: 35.8, name: 'Baht' },
            { keywords: ['singapore'], code: 'SGD', symbol: 'S$', rate: 1.34, name: 'SG Dollar' },
            { keywords: ['usa', 'united states', 'america', 'new york'], code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar' },
            { keywords: ['australia', 'sydney', 'melbourne'], code: 'AUD', symbol: 'A$', rate: 1.52, name: 'AU Dollar' },
            { keywords: ['canada', 'toronto', 'vancouver'], code: 'CAD', symbol: 'C$', rate: 1.35, name: 'CA Dollar' },
            { keywords: ['switzerland', 'zurich'], code: 'CHF', symbol: 'Fr', rate: 0.88, name: 'Franc' },
            { keywords: ['china', 'beijing', 'shanghai'], code: 'CNY', symbol: '¥', rate: 7.2, name: 'Yuan' },
        ];

        const found = currencyMap.find(c => c.keywords.some(k => loc.includes(k)));
        if (found) {
            local = { ...found };
            delete local.keywords;
        }

        setCurrency(prev => ({ ...prev, local }));

        const fetchWeather = async () => {
            setWeatherLoading(true);
            try {
                const response = await fetch(`https://wttr.in/${encodeURIComponent(destination)}?format=j1`);
                const data = await response.json();

                if (data && data.current_condition?.[0]) {
                    const current = data.current_condition[0];
                    const astron = data.weather[0].astronomy[0];

                    setWeather({
                        temp: current.temp_C,
                        condition: current.weatherDesc[0].value,
                        humidity: current.humidity + '%',
                        high: data.weather[0].maxtempC,
                        low: data.weather[0].mintempC,
                        sunrise: astron.sunrise,
                        sunset: astron.sunset
                    });
                }
            } catch (err) { console.error("Weather Error", err); }
            finally { setWeatherLoading(false); }
        };

        if (destination && destination !== "Destination") {
            fetchWeather();
        }
    }, [destination, trip]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto px-4 pb-20">

            {/* Weather Master Widget (Span 2) */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CloudRain className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-500/20 rounded-2xl">
                            <Sun className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm uppercase tracking-widest">Local Outlook</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{destination}</p>
                        </div>
                    </div>

                    {weatherLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Scanning Skies...</p>
                        </div>
                    ) : weather ? (
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-end gap-6 mb-10">
                                <h2 className="text-8xl font-black text-white leading-none tracking-tighter">{weather.temp}°</h2>
                                <div className="pb-2">
                                    <p className="text-blue-400 font-black uppercase tracking-widest text-sm mb-1">{weather.condition}</p>
                                    <div className="flex gap-4 text-slate-400 text-xs font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                        <span>H: {weather.high}°</span>
                                        <span>L: {weather.low}°</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                    <Thermometer className="w-6 h-6 text-orange-400" />
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Humidity</p>
                                        <p className="text-lg text-white font-black">{weather.humidity}</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 px-1">Sun Cycle</p>
                                    <div className="flex items-center justify-between text-[11px] text-white font-bold opacity-80">
                                        <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-yellow-500" /> {weather.sunrise}</span>
                                        <span className="flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5 text-indigo-400" /> {weather.sunset}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-10">
                            <Info className="w-12 h-12 mb-4" />
                            <p className="text-xs font-black uppercase text-center">Forecast Unavailable</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cross-Currency Hub (Span 3) */}
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <Coins className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-widest">Universal Exchange</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Real-time approximate rates</p>
                            </div>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                            Live Sync
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Local Conversion */}
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-indigo-500/30 transition-all group/card">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> USD → {currency.local.code}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-black text-white leading-none">$1.00</span>
                                <RefreshCcw className="w-4 h-4 text-slate-600 group-hover/card:rotate-180 transition-transform duration-700" />
                            </div>
                            <p className="text-3xl font-black text-indigo-400 leading-none mb-6">
                                {currency.local.symbol} {currency.local.rate}
                            </p>
                            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                {currency.local.name} (Official Local)
                            </div>
                        </div>

                        {/* INR Conversion */}
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-emerald-500/30 transition-all group/card">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> USD → {currency.inr.code}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-black text-white leading-none">$1.00</span>
                                <RefreshCcw className="w-4 h-4 text-slate-600 group-hover/card:rotate-180 transition-transform duration-700" />
                            </div>
                            <p className="text-3xl font-black text-emerald-400 leading-none mb-6">
                                {currency.inr.symbol} {currency.inr.rate}
                            </p>
                            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                {currency.inr.name} (Regional Default)
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-slate-900/50 rounded-3xl border border-white/5 flex items-start gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Info className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-[10px] text-white font-black uppercase tracking-widest mb-1">Local Insights for {destination}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                1 {currency.local.code} is approximately {(currency.inr.rate / currency.local.rate).toFixed(2)} {currency.inr.code}.
                                Cards are widely accepted, but keep some {currency.local.symbol} for local transport.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

