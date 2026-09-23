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
      </div>
    </header>
  );
};

export default Navbar;
