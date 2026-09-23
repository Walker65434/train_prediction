import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faMagnifyingGlass,
  faTicket,
  faBolt,
  faBrain,
  faHistory,
  faArrowRight,
  faTrash,
  faSparkles,
  faSignal,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useTrainStore } from '../store/useTrainStore';
import TicketUploader from '../components/TicketUploader';

const POPULAR_TRAINS = [
  { id: '12951', name: 'Mumbai Rajdhani Express', route: 'MMCT → NDLS', type: 'Superfast Rajdhani' },
  { id: '19217', name: 'Saurashtra Janta Express', route: 'BDTS → VRL', type: 'Express' },
  { id: '12002', name: 'Bhopal Shatabdi Express', route: 'NDLS → RKMP', type: 'Shatabdi' },
  { id: '22691', name: 'Bengaluru Rajdhani Express', route: 'SBC → NZM', type: 'Rajdhani' },
];

export const HomePage = () => {
  const [trainInput, setTrainInput] = useState('');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'ticket'
  const navigate = useNavigate();

  const recentSearches = useTrainStore((state) => state.recentSearches);
  const clearRecentSearches = useTrainStore(
    (state) => state.clearRecentSearches
  );
  const addRecentSearch = useTrainStore((state) => state.addRecentSearch);

  const handleSearch = (idToSearch) => {
    const rawId = (idToSearch !== undefined ? idToSearch : trainInput).trim();

    if (!rawId) {
      toast.error('Please enter a 5-digit train number or upload a ticket photo', {
        icon: '🚆',
      });
      return;
    }

    // Validate train number (standard 5 digits)
    if (!/^\d{5}$/.test(rawId)) {
      toast.error(
        'Please enter a valid 5-digit Indian Railways train number (e.g. 12951)',
        {
          duration: 4000,
        }
      );
      return;
    }

    addRecentSearch(rawId);
    navigate(`/track/${rawId}`);
  };

  const handleTicketNumberExtracted = (extractedNum) => {
    if (extractedNum) {
      setTrainInput(extractedNum);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between relative overflow-hidden bg-grid-pattern">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full relative z-10">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-md">
            <FontAwesomeIcon icon={faBrain} className="text-cyan-400 animate-pulse" />
            <span>AI-Driven Delay Prediction & WebSocket Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] font-heading">
            Track Any Train in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              Real-Time
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant Socket.IO stream, machine learning ETA calculations, and client-side ticket OCR scanner. Enter your 5-digit train number or upload a ticket.
          </p>
        </div>

        {/* Input Card */}
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FontAwesomeIcon icon={faTrain} />
              <span>Enter Train Number</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ticket')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ticket'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FontAwesomeIcon icon={faTicket} />
              <span>Upload Ticket Image</span>
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'manual' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  5-Digit Train Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-500 pointer-events-none text-lg">
                    <FontAwesomeIcon icon={faTrain} />
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. 12951 or 19217"
                    value={trainInput}
                    onChange={(e) =>
                      setTrainInput(e.target.value.replace(/\D/g, ''))
                    }
                    className="w-full pl-12 pr-16 py-4 bg-slate-950/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white font-mono text-xl tracking-widest rounded-2xl transition-all shadow-inner outline-none placeholder:text-slate-600"
                  />
                  {trainInput && (
                    <button
                      type="button"
                      onClick={() => setTrainInput('')}
                      className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!trainInput}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-heading font-bold text-base shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="group-hover:scale-110 transition-transform" />
                <span>Track Live Train Status</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <TicketUploader
                onSelectTrainNumber={handleTicketNumberExtracted}
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={!trainInput}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-heading font-bold text-base shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <span>
                    {trainInput
                      ? `Track Train #${trainInput}`
                      : 'Extract & Track'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Suggestions / Sample Trains */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faSparkles} className="text-cyan-400 text-[10px]" />
              <span>Popular Trains</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POPULAR_TRAINS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTrainInput(t.id);
                    handleSearch(t.id);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                        #{t.id}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                        {t.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      {t.route}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center transition-all flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-xs group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches && recentSearches.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faHistory} className="text-indigo-400 text-xs" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-medium"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                  <span>Clear History</span>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {recentSearches.map((item) => (
                  <button
                    key={item.trainId}
                    type="button"
                    onClick={() => {
                      setTrainInput(item.trainId);
                      handleSearch(item.trainId);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white font-mono flex items-center gap-2 transition-all shadow-sm group"
                  >
                    <FontAwesomeIcon
                      icon={faTrain}
                      className="text-[10px] text-cyan-400 group-hover:rotate-12 transition-transform"
                    />
                    <span>#{item.trainId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-14 sm:mt-20">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-center sm:text-left backdrop-blur-md hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
              <FontAwesomeIcon icon={faBolt} className="text-lg" />
            </div>
            <h4 className="font-heading font-bold text-white text-base">
              Real-Time Socket.IO
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persistent live connection feeds delay & station updates instantly without repetitive HTTP polling.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-center sm:text-left backdrop-blur-md hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
              <FontAwesomeIcon icon={faBrain} className="text-lg" />
            </div>
            <h4 className="font-heading font-bold text-white text-base">
              ML-Powered Predictions
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI machine learning pipelines predict arrival delays using real-time factors and history.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-center sm:text-left backdrop-blur-md hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
              <FontAwesomeIcon icon={faTicket} className="text-lg" />
            </div>
            <h4 className="font-heading font-bold text-white text-base">Instant Ticket OCR</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Client-side Tesseract.js scans ticket photos directly in your browser without uploading private data.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 relative z-10">
        RailPredict • React + Vite + Node.js + FastAPI + RabbitMQ + Socket.IO
      </footer>
    </div>
  );
};

export default HomePage;

