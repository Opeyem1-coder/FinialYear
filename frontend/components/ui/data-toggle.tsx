'use client';

import { useEffect, useState } from 'react';
import { Database, Server } from 'lucide-react';
import { isMockMode, toggleMockMode } from '@/lib/api';

export function DataToggle() {
    const [isMock, setIsMock] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setIsMock(isMockMode());
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-full p-1.5 flex items-center gap-1 backdrop-blur-sm bg-opacity-90">

                {/* Mock Data Button */}
                <button
                    onClick={() => toggleMockMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${isMock
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <Database className="w-4 h-4" />
                    <span>Dummy Data</span>
                </button>

                {/* Live Data Button */}
                <button
                    onClick={() => toggleMockMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${!isMock
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <Server className="w-4 h-4" />
                    <span>Live API</span>
                </button>

            </div>
        </div>
    );
}
