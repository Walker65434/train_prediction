import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faMagnifyingGlass,
  faTrain,
  faUser,
  faSignal,
} from '@fortawesome/free-solid-svg-icons';
import { useTrainStore } from '../store/useTrainStore';

const navItems = [
  { label: 'Explore', href: '/' },
  { label: 'Train Search', href: '/' },
  { label: 'Predictions', href: '/#prediction' },
  { label: 'Live Journey', href: '/#live' },
  { label: 'Ticket Scanner', href: '/#scanner' },
];

export const Navbar = () => {
  const location = useLocation();
  const isLiveConnected = useTrainStore((state) => state.isLiveConnected);
  const currentTrainId = useTrainStore((state) => state.currentTrainId);
  const isTrackPage = location.pathname.startsWith('/track');

  return (
    <header className="sticky top-4 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-[rgba(28,27,26,0.08)] bg-[rgba(255,255,255,0.72)] px-4 py-3 shadow-[0_18px_40px_rgba(19,14,8,0.08)] backdrop-blur-xl">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f05d3c] text-white shadow-[0_16px_28px_rgba(240,93,60,0.35)] transition-transform duration-300 group-hover:-translate-y-0.5">
            <FontAwesomeIcon icon={faTrain} className="text-lg" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2d9a6f] ring-2 ring-[#fffaf5]">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div>
            <span className="font-heading text-xl font-black tracking-[-0.06em] text-[#1d1b1a]">
              Rail<span className="text-[#f05d3c]">Pulse</span>
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-[#f7f2eb] px-2 py-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === '/' && item.label === 'Explore'
                  ? 'bg-white text-[#1d1b1a] shadow-sm'
                  : 'text-[#5e5a57] hover:bg-white hover:text-[#1d1b1a]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isTrackPage && currentTrainId && (
            <div className="hidden items-center gap-2 rounded-full border border-[#e7ded3] bg-[#fffaf5] px-3 py-2 text-xs font-medium text-[#1d1b1a] sm:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLiveConnected ? 'bg-[#2d9a6f]' : 'bg-[#d08b2a]'
                  } animate-ping`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isLiveConnected ? 'bg-[#2d9a6f]' : 'bg-[#d08b2a]'
                  }`}
                />
              </span>
              <span>{isLiveConnected ? 'Live' : 'Connecting'} • #{currentTrainId}</span>
            </div>
          )}

          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7ded3] bg-white text-[#1d1b1a] transition-all hover:-translate-y-0.5 hover:shadow-md">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7ded3] bg-[#1d1b1a] text-white shadow-[0_12px_20px_rgba(29,27,26,0.12)] transition-all hover:-translate-y-0.5">
            <FontAwesomeIcon icon={faUser} className="text-sm" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
