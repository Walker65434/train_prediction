import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faBolt, faCircle, faSparkles } from '@fortawesome/free-solid-svg-icons';
import { useTrainStore } from '../store/useTrainStore';

export const Navbar = () => {
  const location = useLocation();
  const isLiveConnected = useTrainStore((state) => state.isLiveConnected);
  const currentTrainId = useTrainStore((state) => state.currentTrainId);
  const isTrackPage = location.pathname.startsWith('/track');

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 text-slate-100 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <FontAwesomeIcon icon={faTrain} className="text-white text-lg group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                Rail<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Predict</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-semibold text-indigo-400">
                <FontAwesomeIcon icon={faBolt} className="text-[8px]" />
                AI ETA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Real-time Train Tracking & ML Delay Predictions
            </p>
          </div>
        </Link>

        {/* Live Status indicator & Navigation */}
        <div className="flex items-center gap-3">
          {isTrackPage && currentTrainId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-slate-300 font-mono text-[11px] font-medium">
                {isLiveConnected ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    Socket Live
                    <span className="text-[10px] text-slate-500">#{currentTrainId}</span>
                  </span>
                ) : (
                  <span className="text-amber-400">Connecting...</span>
                )}
              </span>
            </div>
          )}

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

