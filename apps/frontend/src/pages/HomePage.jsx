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
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 pb-16 pt-8">
      <main className="mx-auto max-w-6xl">
        <section className="rail-panel overflow-hidden px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f4d4c5] bg-[#fff0eb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#cc5a38]">
                <FontAwesomeIcon icon={faBrain} className="text-[10px]" />
                Railway intelligence platform
              </div>

              <div className="space-y-4">
                <h1 className="font-heading text-4xl font-black leading-[0.96] tracking-[-0.08em] text-[#1d1b1a] sm:text-5xl lg:text-7xl">
                  Your journey,
                  <span className="block text-[#f05d3c]">predicted.</span>
                </h1>
                <p className="max-w-xl text-base text-[#5c5754] sm:text-lg">
                  AI-powered train intelligence for smarter, calmer travel. Monitor live ETA,
                  forecast delays, and track each station before arrival.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rail-metric-box">
                  <div className="text-2xl font-black text-[#1d1b1a]">142</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[#736d6a]">Predictions</div>
                </div>
                <div className="rail-metric-box">
                  <div className="text-2xl font-black text-[#1d1b1a]">38</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[#736d6a]">Live trains</div>
                </div>
                <div className="rail-metric-box">
                  <div className="text-2xl font-black text-[#1d1b1a]">12</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[#736d6a]">Delayed</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-[#eadfce] bg-[rgba(255,255,255,0.7)] p-4 shadow-[0_22px_55px_rgba(61,48,42,0.05)] backdrop-blur-xl sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
            <div className="rail-search-field">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#736d6a]">From</label>
              <input
                type="text"
                value={trainInput}
                onChange={(e) => setTrainInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter train no"
                className="mt-2 block w-full border-0 bg-transparent text-2xl font-bold tracking-[-0.05em] text-[#1d1b1a] outline-none placeholder:text-[#b9b1a8]"
              />
            </div>
            <div className="rail-search-field">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#736d6a]">To</label>
              <input
                type="text"
                value="Delhi"
                readOnly
                className="mt-2 block w-full border-0 bg-transparent text-2xl font-bold tracking-[-0.05em] text-[#1d1b1a] outline-none"
              />
            </div>
            <div className="rail-search-field">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#736d6a]">Date</label>
              <div className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-[-0.05em] text-[#1d1b1a]">
                <FontAwesomeIcon icon={faCalendarDay} className="text-base text-[#f05d3c]" />
                <span>23 Sep</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="rail-btn primary h-full min-h-[92px]"
            >
              <span>Search</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </section>

        <div className="mt-8">
          <div className="w-full lg:max-w-2xl">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#736d6a]">
              Search mode
            </div>

            <div className="flex flex-col gap-2 sm:max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`rounded-full px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                  activeTab === 'manual' ? 'bg-[#1d1b1a] text-white' : 'border border-[#eadfce] bg-[#fffaf5] text-[#5e5a57]'
                }`}
              >
                Manual input
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className={`rounded-full px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                  activeTab === 'ticket' ? 'bg-[#1d1b1a] text-white' : 'border border-[#eadfce] bg-[#fffaf5] text-[#5e5a57]'
                }`}
              >
                Ticket OCR
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'manual' ? (
                <div className="rounded-[28px] border border-[#eadfce] bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_16px_40px_rgba(31,28,26,0.04)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0eb] text-[#f05d3c]">
                      <FontAwesomeIcon icon={faTrain} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#736d6a]">Train number</div>
                      <div className="text-xl font-black tracking-[-0.06em] text-[#1d1b1a]">{trainInput || '12951'}</div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      maxLength={5}
                      value={trainInput}
                      onChange={(e) => setTrainInput(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 rounded-2xl border border-[#e9dfd6] bg-[#fffdfb] px-4 py-3 text-lg font-bold tracking-[0.2em] text-[#1d1b1a] outline-none focus:border-[#f2b39d]"
                      placeholder="e.g. 12951"
                    />
                    <button type="button" onClick={() => handleSearch()} className="rail-btn primary">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                      Search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-[#eadfce] bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_16px_40px_rgba(31,28,26,0.04)]">
                  <TicketUploader onSelectTrainNumber={handleTicketNumberExtracted} />
                </div>
              )}
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
