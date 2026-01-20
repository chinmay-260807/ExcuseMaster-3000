
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { CategoryButton } from './components/CategoryButton.tsx';
import { generateExcuse, explainHumor } from './services/geminiService.ts';
import { playPop, playChime, playThud } from './services/soundService.ts';
import { Category, AppState, HistoryItem, ExcuseResponse } from './types.ts';

const HISTORY_KEY = 'excuse_master_history_neo_v4';
const THEME_KEY = 'excuse_master_theme';
const SOUND_KEY = 'excuse_master_sound';

const ConfigGuard = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-[#fef08a]">
    <div className="neobrutalism-card p-8 bg-white max-w-lg border-4 border-black shadow-[12px_12px_0px_0px_#000]">
      <h2 className="font-heading text-4xl uppercase mb-6 leading-none">Config Error</h2>
      <div className="bg-red-500 text-white p-4 font-bold border-4 border-black mb-6">
        MISSING: API_KEY
      </div>
      <p className="font-bold mb-4">To fix the blank screen/error, you must add your Gemini API Key to Vercel:</p>
      <ol className="list-decimal list-inside space-y-2 mb-6 font-mono text-sm bg-gray-100 p-4 border-2 border-black">
        <li>Go to your Vercel Dashboard</li>
        <li>Select this Project &gt; Settings &gt; Environment Variables</li>
        <li>Key: <span className="bg-yellow-300 px-1">API_KEY</span></li>
        <li>Value: <span className="bg-yellow-300 px-1">[Your_Gemini_Key]</span></li>
        <li><strong>CRITICAL:</strong> Redeploy the application via the "Deployments" tab</li>
      </ol>
      <button 
        onClick={() => window.location.reload()}
        className="neobrutalism-button w-full py-4 bg-indigo-500 text-white font-heading uppercase hover:bg-indigo-400"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  // Direct check for the environment variable. Vite's 'define' will replace this literal string.
  const apiKey = process.env.API_KEY;
  const hasApiKey = !!apiKey && apiKey !== 'undefined' && apiKey !== '';
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'dark';
    } catch { return false; }
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved === 'true';
    } catch { return false; }
  });

  const [state, setState] = useState<AppState>({
    currentExcuse: "Fabricate your first alibi.",
    category: Category.SCHOOL,
    isDramatic: false,
    isLoading: false,
    error: null,
    explanation: null,
    isExplaining: false,
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGenerate = async () => {
    if (!isMuted) playPop();
    setState(prev => ({ ...prev, isLoading: true, error: null, explanation: null }));

    try {
      const result: ExcuseResponse = await generateExcuse(state.category, state.isDramatic);
      const newExcuse = `${result.emoji} ${result.text}`;
      
      setState(prev => ({
        ...prev,
        currentExcuse: newExcuse,
        isLoading: false
      }));

      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        text: result.text,
        emoji: result.emoji,
        category: state.category,
        isDramatic: state.isDramatic,
        timestamp: Date.now(),
      };

      setHistory(prev => [newItem, ...prev].slice(0, 10));
      if (!isMuted) playChime();
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Something went wrong"
      }));
      if (!isMuted) playThud();
    }
  };

  const handleExplain = async () => {
    if (state.explanation || state.isExplaining) return;
    if (!isMuted) playPop();
    
    setState(prev => ({ ...prev, isExplaining: true }));
    try {
      const explanation = await explainHumor(state.currentExcuse, state.category);
      setState(prev => ({ ...prev, explanation, isExplaining: false }));
    } catch {
      setState(prev => ({ ...prev, isExplaining: false }));
    }
  };

  const categories = useMemo(() => [
    { type: Category.SCHOOL, icon: '🎒' },
    { type: Category.OFFICE, icon: '💼' },
    { type: Category.CODING, icon: '💻' },
    { type: Category.SOCIAL, icon: '🎉' },
  ], []);

  if (!hasApiKey) return <ConfigGuard />;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tighter leading-none">
          Excuse<span className="text-indigo-600 dark:text-indigo-400 italic">Master</span>
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 border-4 border-black bg-white dark:bg-zinc-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 border-4 border-black bg-white dark:bg-zinc-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {categories.map((cat) => (
          <CategoryButton
            key={cat.type}
            category={cat.type}
            icon={cat.icon}
            isActive={state.category === cat.type}
            onClick={(c) => setState(prev => ({ ...prev, category: c }))}
          />
        ))}
      </div>

      <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={state.isDramatic}
            onChange={(e) => setState(prev => ({ ...prev, isDramatic: e.target.checked }))}
            className="hidden"
          />
          <div className={`w-12 h-6 border-4 border-black relative transition-colors ${state.isDramatic ? 'bg-pink-500' : 'bg-white'}`}>
            <div className={`absolute top-0 bottom-0 w-4 bg-black transition-all ${state.isDramatic ? 'right-0' : 'left-0'}`}></div>
          </div>
          <span className="font-heading uppercase text-sm tracking-widest group-hover:underline">
            Drama Mode {state.isDramatic ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>

      <div className="min-h-[160px] flex flex-col items-center justify-center text-center p-6 border-4 border-black bg-white dark:bg-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 relative overflow-hidden">
        {state.isLoading ? (
          <div className="font-heading uppercase text-2xl animate-pulse">Fabricating...</div>
        ) : state.error ? (
          <div className="text-red-600 dark:text-red-400 font-bold p-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
            {state.error}
          </div>
        ) : (
          <p className="text-xl sm:text-2xl font-bold leading-tight z-10">
            {state.currentExcuse}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-10">
        <button
          onClick={handleGenerate}
          disabled={state.isLoading}
          className="neobrutalism-button py-6 bg-indigo-500 hover:bg-indigo-400 text-white font-heading text-2xl uppercase tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_#000] disabled:opacity-50"
        >
          Generate Lie
        </button>

        {!state.isLoading && state.currentExcuse.length > 25 && (
          <button
            onClick={handleExplain}
            disabled={state.isExplaining}
            className="font-heading uppercase text-xs tracking-widest underline decoration-indigo-500 decoration-4 underline-offset-4 hover:text-indigo-600 transition-colors"
          >
            {state.isExplaining ? 'Analyzing...' : 'Why is this funny?'}
          </button>
        )}
      </div>

      {state.explanation && (
        <div className="mb-10 p-4 border-l-8 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 italic text-sm">
          <span className="font-bold uppercase not-italic block mb-1">Analysis:</span>
          {state.explanation}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="font-heading text-xl uppercase mb-4 border-b-4 border-black inline-block">Previous Alibis</h2>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="p-4 border-4 border-black bg-white dark:bg-zinc-800 text-sm flex gap-4 items-center">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold leading-tight">{item.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold opacity-50 px-1 border border-black/20">{item.category}</span>
                    {item.isDramatic && <span className="text-[10px] uppercase font-bold text-pink-500">Dramatic</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
