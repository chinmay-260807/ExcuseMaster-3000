
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CategoryButton } from './components/CategoryButton';
import { generateExcuse, explainHumor } from './services/geminiService';
import { playPop, playChime, playThud } from './services/soundService';
import { Category, AppState, HistoryItem } from './types';

const HISTORY_KEY = 'excuse_master_history_neo_v4';
const THEME_KEY = 'excuse_master_theme';
const SOUND_KEY = 'excuse_master_sound';
const SEARCH_KEY = 'excuse_master_search';

// Simple Error Boundary Fallback
const ErrorFallback = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-red-500 flex items-center justify-center p-4">
    <div className="neobrutalism-card p-8 bg-white max-w-md text-center border-4 border-black shadow-[10px_10px_0px_0px_#000]">
      <h1 className="font-heading text-4xl uppercase mb-4">System Crash</h1>
      <p className="font-bold mb-6 italic">"{error}"</p>
      <button 
        onClick={() => window.location.reload()}
        className="neobrutalism-button px-6 py-3 bg-yellow-400 font-heading uppercase"
      >
        Reboot System
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved === 'true';
  });

  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return localStorage.getItem(SEARCH_KEY) || '';
  });

  const [state, setState] = useState<AppState>({
    currentExcuse: "NEED A COVER STORY?",
    category: Category.SCHOOL,
    isDramatic: false,
    isLoading: false,
    error: null,
    explanation: null,
    isExplaining: false,
  });
  
  const [currentEmoji, setCurrentEmoji] = useState("⚡");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem(SEARCH_KEY, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const performGeneration = useCallback(async (targetCategory: Category) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, category: targetCategory, explanation: null }));
    try {
      const response = await generateExcuse(targetCategory, state.isDramatic);
      
      const newExcuse: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9) + Date.now(),
        text: response.text,
        emoji: response.emoji,
        category: targetCategory,
        isDramatic: state.isDramatic,
        timestamp: Date.now()
      };

      if (!isMuted) playPop();
      setState(prev => ({ ...prev, currentExcuse: response.text, isLoading: false }));
      setCurrentEmoji(response.emoji);
      setHistory(prev => [newExcuse, ...prev].slice(0, 30));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, [state.isDramatic, isMuted]);

  const handleGenerate = () => performGeneration(state.category);

  const handleSurprise = () => {
    const categories = Object.values(Category);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    performGeneration(randomCategory);
  };

  const handleExplain = async () => {
    if (!state.currentExcuse || state.isLoading || state.isExplaining || state.currentExcuse === "NEED A COVER STORY?") return;
    
    setState(prev => ({ ...prev, isExplaining: true }));
    try {
      if (!isMuted) playPop();
      const explanation = await explainHumor(state.currentExcuse, state.category);
      setState(prev => ({ ...prev, explanation, isExplaining: false }));
    } catch (err) {
      setState(prev => ({ ...prev, isExplaining: false }));
    }
  };

  const handleCopy = (text?: string) => {
    const targetText = text || state.currentExcuse;
    navigator.clipboard.writeText(targetText);
    if (!isMuted) playChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    if (window.confirm("ERASE ALL EVIDENCE? THIS CANNOT BE UNDONE.")) {
      if (!isMuted) playThud();
      setHistory([]);
    }
  };

  const toggleTheme = () => {
    document.body.classList.add('theme-transition');
    setIsDarkMode(!isDarkMode);
    setTimeout(() => document.body.classList.remove('theme-transition'), 300);
  };

  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const lowSearch = searchTerm.toLowerCase();
    return history.filter(item => 
      item.text.toLowerCase().includes(lowSearch) || 
      item.category.toLowerCase().includes(lowSearch)
    );
  }, [history, searchTerm]);

  if (!isMounted) return (
    <div className="min-h-screen bg-[#fef08a] flex items-center justify-center">
      <div className="font-heading text-4xl animate-pulse">LOADING SYSTEM...</div>
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6 sm:gap-8">
        <header className="text-left border-b-4 sm:border-b-8 border-[var(--border)] pb-4 sm:pb-6 relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <button 
              onClick={toggleSound}
              className="neobrutalism-button px-3 py-2 text-xl hover:bg-yellow-400 hover:text-black border-[var(--border)]"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button 
              onClick={toggleTheme}
              className="neobrutalism-button px-3 py-2 text-xl hover:bg-indigo-500 hover:text-white border-[var(--border)]"
              title="Toggle Theme"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>

          <h1 className="text-4xl sm:text-7xl font-heading text-[var(--text)] uppercase leading-[0.9] tracking-tighter">
            Excuse<br/><span className="bg-indigo-600 text-white px-2 sm:px-3 inline-block transform -rotate-1 mt-1">Master</span><br/>3000
          </h1>
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
            <p className="font-bold uppercase tracking-widest text-[9px] sm:text-[10px] bg-[var(--border)] text-[var(--card-bg)] px-2 py-1 border-[var(--border)]">
              STATUS: NOMINAL
            </p>
            <p className="font-bold uppercase tracking-widest text-[9px] sm:text-[10px] bg-lime-400 border-2 border-[var(--border)] px-2 py-1 text-black">
              ENGINE: GEMINI-3
            </p>
          </div>
        </header>

        {/* Category Grid Section */}
        <section className="relative">
          <div className="absolute -top-3 left-4 z-10">
             <span className="font-heading text-[10px] sm:text-xs uppercase tracking-widest bg-yellow-400 text-black px-3 py-1 border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_var(--border)]">
               01. SELECT SECTOR
             </span>
          </div>
          <div className="neobrutalism-card bg-[var(--bg)] p-3 sm:p-6 border-[var(--border)] shadow-[6px_6px_0px_0px_var(--shadow)]">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mt-2">
              <CategoryButton 
                category={Category.SCHOOL} 
                icon="📓"
                isActive={state.category === Category.SCHOOL} 
                onClick={(c) => setState(prev => ({ ...prev, category: c }))} 
              />
              <CategoryButton 
                category={Category.OFFICE} 
                icon="🏢"
                isActive={state.category === Category.OFFICE} 
                onClick={(c) => setState(prev => ({ ...prev, category: c }))} 
              />
              <CategoryButton 
                category={Category.CODING} 
                icon="👾"
                isActive={state.category === Category.CODING} 
                onClick={(c) => setState(prev => ({ ...prev, category: c }))} 
              />
              <CategoryButton 
                category={Category.SOCIAL} 
                icon="🍹"
                isActive={state.category === Category.SOCIAL} 
                onClick={(c) => setState(prev => ({ ...prev, category: c }))} 
              />
              <button
                onClick={handleSurprise}
                className={`
                  neobrutalism-button flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-3 sm:py-3 
                  font-heading uppercase tracking-tighter border-4 bg-yellow-400 hover:bg-yellow-500 text-black border-[var(--border)]
                  active:translate-x-[2px] active:translate-y-[2px] active:shadow-none h-full shadow-[4px_4px_0px_0px_var(--shadow)]
                `}
                title="Surprise Me"
              >
                <span className="text-lg sm:text-2xl flex-shrink-0">🎲</span>
                <span className="text-[9px] sm:text-[11px] lg:text-xs text-center sm:text-left leading-[1.1] sm:leading-tight px-1 uppercase">Surprise</span>
              </button>
            </div>
          </div>
        </section>

        {/* Excuse Box */}
        <div className={`
          relative neobrutalism-card p-6 sm:p-10 min-h-[220px] flex items-center justify-center transition-all duration-300 border-[var(--border)]
          ${state.isDramatic 
            ? 'bg-orange-500 rotate-1 shadow-[8px_8px_0px_0px_var(--shadow)]' 
            : 'bg-[var(--card-bg)] -rotate-1 shadow-[10px_10px_0px_0px_var(--shadow)]'
          }
        `}>
          {state.isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-[8px] sm:border-[10px] border-[var(--border)] border-t-indigo-500 animate-spin mb-4 sm:mb-6"></div>
              <p className="font-heading uppercase text-xl sm:text-2xl tracking-tighter text-[var(--text)]">FABRICATING...</p>
            </div>
          ) : (
            <div className="text-center pop-in w-full px-2">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 bg-[var(--border)] text-[var(--card-bg)] w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto border-4 border-[var(--card-bg)] neobrutalism-button transform rotate-3">
                {currentEmoji}
              </div>
              <p className={`text-xl sm:text-2xl font-heading tracking-tight leading-tight break-words
                ${state.isDramatic ? 'text-black drop-shadow-[1px_1px_0px_#fff]' : 'text-[var(--text)]'}
              `}>
                "{state.currentExcuse}"
              </p>
            </div>
          )}

          {state.error && (
            <div className="absolute inset-0 bg-red-600 text-white p-6 flex flex-col items-center justify-center font-heading uppercase text-center border-4 border-black z-10">
              <span className="text-4xl mb-2">⚠️</span>
              ERROR: {state.error}
            </div>
          )}
        </div>

        {/* Explanation Box */}
        {(state.explanation || state.isExplaining) && (
          <div className="pop-in neobrutalism-card p-4 sm:p-6 bg-yellow-100 border-4 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--border)] text-black">
            <h3 className="font-heading text-xs sm:text-sm uppercase mb-2 border-b-2 border-black inline-block">ABSURDITY ANALYSIS</h3>
            {state.isExplaining ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-4 border-black border-t-transparent animate-spin"></div>
                <p className="font-bold text-xs uppercase italic">CONSULTING THE COMEDY ORACLE...</p>
              </div>
            ) : (
              <p className="text-sm sm:text-base font-bold italic leading-tight">
                {state.explanation}
              </p>
            )}
          </div>
        )}

        {/* Primary Controls */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={() => setState(prev => ({ ...prev, isDramatic: !prev.isDramatic }))}
            className={`
              neobrutalism-button py-3 sm:py-5 font-heading uppercase tracking-tighter text-sm sm:text-lg border-[var(--border)]
              ${state.isDramatic 
                ? 'bg-orange-500 text-white shadow-[2px_2px_0px_0px_var(--shadow)] translate-x-1 translate-y-1' 
                : 'bg-[var(--card-bg)] text-[var(--text)]'
              }
            `}
          >
            {state.isDramatic ? '🎭 LESS DRAMA' : '🎭 MORE DRAMA'}
          </button>
          <button
            onClick={() => handleCopy()}
            className={`
              neobrutalism-button py-3 sm:py-5 font-heading uppercase tracking-tighter text-sm sm:text-lg border-[var(--border)]
              ${copied ? 'bg-green-400 !text-black' : 'bg-[var(--card-bg)] text-[var(--text)]'}
            `}
          >
            {copied ? 'COPIED!' : '📋 COPY LOG'}
          </button>
        </div>

        {/* Generate / Explain Controls */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={handleGenerate}
            disabled={state.isLoading}
            className={`
              neobrutalism-button flex-grow py-6 sm:py-8 font-heading text-3xl sm:text-5xl uppercase tracking-tighter border-[var(--border)]
              ${state.isLoading 
                ? 'bg-gray-400 text-black' 
                : 'bg-[var(--border)] text-[var(--card-bg)] hover:opacity-90 active:translate-x-1 active:translate-y-1 active:shadow-none'
              }
            `}
          >
            {state.isLoading ? 'WORKING...' : 'FABRICATE'}
          </button>
          <button
            onClick={handleExplain}
            disabled={state.isLoading || state.isExplaining || state.currentExcuse === "NEED A COVER STORY?"}
            className={`
              neobrutalism-button w-20 sm:w-28 flex flex-col items-center justify-center font-heading uppercase tracking-tighter text-[10px] sm:text-xs border-[var(--border)]
              ${state.isExplaining || state.isLoading || state.currentExcuse === "NEED A COVER STORY?"
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }
            `}
            title="Explain Humor"
          >
            <span className="text-2xl sm:text-3xl mb-1">🧐</span>
            WHY?
          </button>
        </div>

        {/* History reports */}
        {(history.length > 0 || searchTerm) && (
          <div className="mt-8 sm:mt-12">
            <div className="flex items-center justify-between border-b-4 sm:border-b-8 border-[var(--border)] pb-3 sm:pb-4 mb-4 sm:mb-6">
              <h2 className="font-heading text-xl sm:text-2xl uppercase tracking-tighter bg-[var(--border)] text-[var(--card-bg)] px-2 sm:px-3 rotate-1 border-[var(--border)]">ARCHIVED LIES</h2>
              <button 
                onClick={clearHistory}
                className="font-heading text-[10px] sm:text-xs border-4 border-[var(--border)] px-3 sm:px-4 py-1 sm:py-2 hover:bg-red-500 transition-all hover:text-white bg-[var(--card-bg)] text-[var(--text)]"
              >
                PURGE
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH ARCHIVES..."
                className="w-full neobrutalism-button py-3 sm:py-4 px-4 sm:px-6 font-heading uppercase tracking-tighter text-sm sm:text-lg bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] focus:outline-none focus:ring-4 focus:ring-indigo-500 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-heading text-lg sm:text-xl hover:text-red-500 text-[var(--text)]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 sm:pr-4 pb-10">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  className={`
                    history-item-animate neobrutalism-card p-4 sm:p-5 flex gap-3 sm:gap-5 items-start group relative transition-transform border-[var(--border)]
                    ${item.isDramatic ? 'bg-orange-100 !text-black' : 'bg-[var(--card-bg)] text-[var(--text)]'}
                  `}
                >
                  <div className="bg-[var(--border)] text-[var(--card-bg)] w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-3xl font-bold flex-shrink-0 border-4 border-[var(--border)] transform group-hover:rotate-0 transition-transform">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <span className="text-[8px] sm:text-[10px] font-black border-2 border-[var(--border)] px-1.5 sm:px-2 py-0.5 uppercase bg-[var(--card-bg)] text-[var(--text)]">
                        {item.category}
                      </span>
                      {item.isDramatic && (
                        <span className="text-[8px] sm:text-[10px] font-black border-2 border-[var(--border)] px-1.5 sm:px-2 py-0.5 uppercase bg-orange-400 text-black">
                          DRAMATIC
                        </span>
                      )}
                    </div>
                    <p className={`text-sm sm:text-lg font-bold tracking-tight leading-snug break-words ${item.isDramatic ? 'text-black' : 'text-[var(--text)]'}`}>
                      {item.text}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopy(item.text)}
                    className="neobrutalism-button w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 flex-shrink-0 border-[var(--border)]"
                    title="COPY"
                  >
                    📋
                  </button>
                </div>
              ))}
              {filteredHistory.length === 0 && history.length > 0 && (
                <div className="text-center py-10 border-4 border-dashed border-[var(--border)] bg-[var(--card-bg)]">
                  <p className="font-heading uppercase text-[var(--text)]">NO MATCHING EVIDENCE FOUND</p>
                </div>
              )}
              {history.length === 0 && !searchTerm && (
                <div className="text-center py-10 border-4 border-dashed border-[var(--border)] bg-[var(--card-bg)]">
                  <p className="font-heading uppercase text-[var(--text)]">ARCHIVE IS EMPTY</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
