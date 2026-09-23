import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBolt,
  faBrain,
  faCalendarDay,
  faChartLine,
  faClock,
  faMagnifyingGlass,
  faMapLocationDot,
  faTicket,
  faTrain,
  faWandMagicSparkles,
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
  const [activeTab, setActiveTab] = useState('manual');
  const navigate = useNavigate();

  const recentSearches = useTrainStore((state) => state.recentSearches);
  const clearRecentSearches = useTrainStore((state) => state.clearRecentSearches);
  const addRecentSearch = useTrainStore((state) => state.addRecentSearch);

  const handleSearch = (idToSearch) => {
    const rawId = (idToSearch !== undefined ? idToSearch : trainInput).trim();

    if (!rawId) {
      toast.error('Please enter a 5-digit train number or upload a ticket photo', {
        icon: '🚆',
      });
      return;
    }

    if (!/^\d{5}$/.test(rawId)) {
      toast.error('Please enter a valid 5-digit Indian Railways train number (e.g. 12951)', {
        duration: 4000,
      });
      return;
    }

    addRecentSearch(rawId);
    navigate(`/track/${rawId}`);
  };

  const handleTicketNumberExtracted = (extractedNum) => {
    if (extractedNum) {
      setTrainInput(extractedNum);
      handleSearch(extractedNum);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 pb-16 pt-8">
      <main className="mx-auto max-w-6xl">
        <section className="rail-panel overflow-hidden px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                <FontAwesomeIcon icon={faBrain} className="text-[10px]" />
                Railway intelligence platform
              </div>

              <div className="space-y-4">
                <h1 className="font-heading text-4xl font-black leading-[0.96] tracking-[-0.08em] text-slate-900 sm:text-5xl lg:text-7xl">
                  Your journey,
                  <span className="block text-orange-600">predicted.</span>
                </h1>
                <p className="max-w-xl text-base text-slate-500 sm:text-lg">
                  AI-powered train intelligence for smarter, calmer travel. Monitor live ETA,
                  forecast delays, and track each station before arrival.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rail-metric-box">
                  <div className="text-2xl font-black text-slate-900">142</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Predictions</div>
                </div>
                <div className="rail-metric-box">
                  <div className="text-2xl font-black text-slate-900">38</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Live trains</div>
                </div>
                <div className="rail-metric-box">
                  <div className="text-2xl font-black text-slate-900">12</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Delayed</div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-orange-500/20 to-blue-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-2 shadow-2xl backdrop-blur-xl">
                <img
                  src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=1200"
                  alt="Modern high-speed train"
                  className="h-full w-full rounded-[1.5rem] object-cover shadow-inner"
                  style={{ maxHeight: '450px' }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <div className="w-full lg:max-w-6xl">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Search mode
            </div>

            <div className="mt-4">
                <div className="rail-panel p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-orange-600 border border-white/50 shadow-sm">
                      <FontAwesomeIcon icon={faTrain} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Train number</div>
                      <div className="text-xl font-black tracking-[-0.06em] text-slate-900">{trainInput || '12951'}</div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      maxLength={5}
                      value={trainInput}
                      onChange={(e) => setTrainInput(e.target.value.replace(/\D/g, ''))}
                      className="rail-search-field flex-1 text-lg font-bold tracking-[0.2em] outline-none focus:border-white/30"
                      placeholder="e.g. 12951"
                    />
                    <button type="button" onClick={() => handleSearch()} className="rail-btn primary">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                      Search
                    </button>
                  </div>
              </div>
              <br />
                <div className="rail-panel p-4">
                  <TicketUploader onSelectTrainNumber={handleTicketNumberExtracted} />
                </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rail-feature-card">
            <div className="rail-icon warm"><FontAwesomeIcon icon={faBolt} /></div>
            <h3>Live updates</h3>
            <p>Persistent socket stream pushes live ETA and station changes without reloading the page.</p>
          </div>
          <div className="rail-feature-card">
            <div className="rail-icon blue"><FontAwesomeIcon icon={faBrain} /></div>
            <h3>ML forecast</h3>
            <p>Arrival probabilities and delay predictions are surfaced alongside the real-time route.</p>
          </div>
          <div className="rail-feature-card">
            <div className="rail-icon green"><FontAwesomeIcon icon={faTicket} /></div>
            <h3>OCR scanning</h3>
            <p>Detect the train number from scanned tickets and jump straight into live tracking.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
