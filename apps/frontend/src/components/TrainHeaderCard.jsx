import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faArrowLeft,
  faArrowRight,
  faClockRotateLeft,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export const TrainHeaderCard = ({ trainData, lastUpdated }) => {
  if (!trainData) return null;

  const {
    trainId,
    trainName = 'Express Special',
    source,
    destination,
    status = 'RUNNING',
  } = trainData;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Track URL copied to clipboard!', { icon: '🔗' });
  };

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Just now';

  return (
    <div className="rounded-3xl border border-base-700/80 bg-gradient-to-br from-base-900 via-base-900/90 to-base-950 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10">
        {/* Navigation & Actions Top row */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-base-content/70 hover:text-white px-3 py-1.5 rounded-xl bg-base-800/80 hover:bg-base-800 border border-base-700/60 transition-all"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Search Another Train</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              type="button"
              className="btn btn-xs btn-ghost border border-base-700 text-base-content/70 hover:text-white rounded-lg"
              title="Share Tracking Link"
            >
              <FontAwesomeIcon icon={faShareNodes} /> Share
            </button>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="badge badge-primary font-mono text-xs font-bold px-3 py-1 tracking-wider">
                #{trainId}
              </span>
              <span className="badge badge-outline font-mono text-xs px-2.5 py-1">
                LIVE ETA
              </span>
              <span
                className={`badge text-xs font-semibold px-2.5 py-1 ${
                  status === 'RUNNING'
                    ? 'badge-success text-success-content'
                    : status === 'DELAYED'
                      ? 'badge-warning text-warning-content'
                      : 'badge-neutral'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                {status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {trainName}
            </h1>

            {/* Source to Destination Route Banner */}
            <div className="flex items-center gap-3 text-sm text-base-content/80 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-white">
                <span>{source?.stationName || 'Origin'}</span>
                {source?.stationCode && (
                  <span className="text-xs font-mono text-primary font-semibold">
                    ({source.stationCode})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-primary">
                <span className="h-[2px] w-6 bg-primary/60 rounded" />
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </div>

              <div className="flex items-center gap-1.5 font-medium text-white">
                <span>{destination?.stationName || 'Destination'}</span>
                {destination?.stationCode && (
                  <span className="text-xs font-mono text-primary font-semibold">
                    ({destination.stationCode})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Last sync info */}
          <div className="flex items-center gap-3 lg:self-center p-3 rounded-2xl bg-base-800/60 border border-base-700/60 text-xs text-base-content/70">
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              className="text-primary text-sm"
            />
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-base-content/50">
                Last Live Sync
              </div>
              <div className="font-mono font-medium text-white">
                {formattedTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainHeaderCard;
