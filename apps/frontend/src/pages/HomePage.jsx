import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faMagnifyingGlass,
  faTicket,
  faBolt,
  faClock,
  faBrain,
  faHistory,
  faArrowRight,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useTrainStore } from '../store/useTrainStore';
import TicketUploader from '../components/TicketUploader';

const POPULAR_TRAINS = [
  { id: '12951', name: 'Mumbai Rajdhani Express', route: 'MMCT → NDLS' },
  { id: '19217', name: 'Saurashtra Janta Express', route: 'BDTS → VRL' },
  { id: '12002', name: 'Bhopal Shatabdi Express', route: 'NDLS → RKMP' },
  { id: '22691', name: 'Bengaluru Rajdhani Express', route: 'SBC → NZM' },
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
      toast.error('Please enter a train number or upload a ticket', {
        icon: '🚆',
      });
      return;
    }

    // Validate train number (standard 5 digits or alphanumeric)
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide shadow-sm">
            <FontAwesomeIcon icon={faBrain} />
            <span>AI-Driven Delay Prediction Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Track Any Train in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Real-Time
            </span>
          </h1>

          <p className="text-sm sm:text-base text-base-content/70 max-w-2xl mx-auto">
            Live Socket.IO updates, machine learning ETA calculations, and
            instant ticket OCR. Enter your 5-digit train number or upload a
            ticket screenshot.
          </p>
        </div>

        {/* Input Card */}
        <div className="max-w-2xl mx-auto rounded-3xl border border-base-700/80 bg-base-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-base-800/80 rounded-2xl border border-base-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'manual'
                  ? 'bg-primary text-primary-content shadow-md'
                  : 'text-base-content/70 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faTrain} />
              <span>Enter Train Number</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ticket')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ticket'
                  ? 'bg-primary text-primary-content shadow-md'
                  : 'text-base-content/70 hover:text-white'
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
                <label className="block text-xs font-semibold text-base-content/70 uppercase tracking-wider mb-2">
                  5-Digit Train Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-base-content/40 pointer-events-none text-base">
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
                    className="input input-lg w-full pl-12 pr-4 bg-slate-950/80 border border-slate-700 focus:border-primary text-white font-mono text-lg tracking-widest rounded-2xl transition-all shadow-inner"
                  />
                  {trainInput && (
                    <button
                      type="button"
                      onClick={() => setTrainInput('')}
                      className="absolute right-4 text-xs text-base-content/40 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!trainInput}
                className="btn btn-primary btn-lg w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
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
                  className="btn btn-primary btn-lg w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
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
          <div className="pt-2 border-t border-base-800">
            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2.5">
              Popular Trains
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_TRAINS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTrainInput(t.id);
                    handleSearch(t.id);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-base-800/50 hover:bg-base-800 border border-base-700/50 hover:border-primary/50 text-left transition-all group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary">
                        {t.id}
                      </span>
                      <span className="text-xs font-medium text-white truncate max-w-[130px]">
                        {t.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-base-content/50 font-mono">
                      {t.route}
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-xs text-base-content/40 group-hover:text-primary transition-colors pr-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches && recentSearches.length > 0 && (
            <div className="pt-2 border-t border-base-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faHistory} />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[11px] text-base-content/50 hover:text-error transition-colors"
                >
                  Clear All
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
                    className="px-3 py-1.5 rounded-xl bg-base-800/80 hover:bg-base-700 border border-base-700 text-xs text-base-content/90 hover:text-white font-mono flex items-center gap-1.5 transition-all"
                  >
                    <FontAwesomeIcon
                      icon={faTrain}
                      className="text-[10px] text-primary"
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
          <div className="p-5 rounded-2xl bg-base-900/40 border border-base-800 space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <h4 className="font-bold text-white text-sm">
              Real-Time Socket.IO
            </h4>
            <p className="text-xs text-base-content/60">
              Persistent live connection feeds delay & station updates without
              repetitive HTTP polling.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-base-900/40 border border-base-800 space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto sm:mx-0">
              <FontAwesomeIcon icon={faBrain} />
            </div>
            <h4 className="font-bold text-white text-sm">
              ML-Powered Predictions
            </h4>
            <p className="text-xs text-base-content/60">
              FastAPI machine learning pipelines predict arrival delays using
              real-time factors and history.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-base-900/40 border border-base-800 space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto sm:mx-0">
              <FontAwesomeIcon icon={faTicket} />
            </div>
            <h4 className="font-bold text-white text-sm">Instant Ticket OCR</h4>
            <p className="text-xs text-base-content/60">
              Client-side Tesseract.js scans ticket photos directly in your
              browser without uploading private data.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-base-800/80 py-6 text-center text-xs text-base-content/50">
        Train ETA System • React + Vite + Node.js + FastAPI + RabbitMQ +
        Socket.IO
      </footer>
    </div>
  );
};

export default HomePage;
