import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faSignal, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useTrainStore } from '../store/useTrainStore';

export const Navbar = () => {
  const location = useLocation();
  const isLiveConnected = useTrainStore((state) => state.isLiveConnected);
  const currentTrainId = useTrainStore((state) => state.currentTrainId);
  const isTrackPage = location.pathname.startsWith('/track');

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-base-900/80 border-b border-base-700/40 text-base-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <FontAwesomeIcon icon={faTrain} className="text-white text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Rail<span className="text-primary">Predict</span>
              </span>
              <span className="badge badge-xs badge-primary font-mono text-[10px] tracking-wider px-1.5 py-0.5">
                AI ETA
              </span>
            </div>
            <p className="text-xs text-base-content/60 hidden sm:block">
              Real-time Train Tracking & ML Predictions
            </p>
          </div>
        </Link>

        {/* Live Status indicator & Navigation */}
        <div className="flex items-center gap-4">
          {isTrackPage && currentTrainId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-800/80 border border-base-700 text-xs">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isLiveConnected
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-base-content/80 font-mono">
                {isLiveConnected ? 'Live Socket Active' : 'Connecting...'}
              </span>
            </div>
          )}

          <Link
            to="/"
            className="btn btn-sm btn-ghost hover:bg-base-800 rounded-lg text-xs sm:text-sm font-medium text-base-content/80 hover:text-white"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
