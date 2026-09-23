import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faArrowLeft,
  faArrowRight,
  faClockRotateLeft,
  faShareNodes,
  faCheck,
  faSignal,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { TRAIN_STATUS } from '@repo/constants/result';

export const TrainHeaderCard = ({ trainData, lastUpdated }) => {
  if (!trainData) return null;

  const {
    trainId,
    trainName = `Train #${trainId}`,
    source,
    destination,
    status = TRAIN_STATUS.RUNNING,
  } = trainData;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Track URL copied to clipboard!', { icon: '🔗' });
    }
  };

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Just now';

  // Compute status theme
  const isRunning = status.toUpperCase() === 'RUNNING';
  const isDelayed = status.toUpperCase() === 'DELAYED';

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10">
        {/* Navigation & Share Row */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Search Another Train</span>
          </Link>

          <button
            onClick={handleShare}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-2"
            title="Share Tracking Link"
          >
            <FontAwesomeIcon icon={faShareNodes} className="text-cyan-400" />
            <span>Share Link</span>
          </button>
        </div>

        {/* Main Train Details */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono font-bold text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-3 py-1 rounded-xl shadow-sm tracking-wider">
                #{trainId}
              </span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                LIVE ETA STREAM
              </span>
              <span
                className={`badge text-xs font-semibold px-2.5 py-1 ${
                  status === TRAIN_STATUS.RUNNING
                    ? 'badge-success text-success-content'
                    : status === TRAIN_STATUS.DELAYED
                      ? 'badge-warning text-warning-content'
                      : status === TRAIN_STATUS.SCHEDULED
                        ? 'badge-info text-info-content'
                        : status === TRAIN_STATUS.ARRIVED
                          ? 'badge-primary text-primary-content'
                          : status === TRAIN_STATUS.CANCELLED
                            ? 'badge-error text-error-content'
                            : 'badge-neutral'
                }`}
              >
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
                {status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
              {trainName}
            </h1>

            {/* Source to Destination Route Visualizer */}
            <div className="flex items-center gap-3 text-sm text-slate-300 flex-wrap pt-1">
              <div className="flex items-center gap-2 font-semibold text-white bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
                <FontAwesomeIcon
                  icon={faTrain}
                  className="text-cyan-400 text-xs"
                />
                <span>{source?.stationName || 'Source Station'}</span>
                {source?.stationCode && (
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    {source.stationCode}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-[2px] w-6 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded" />
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-xs animate-pulse"
                />
              </div>

              <div className="flex items-center gap-2 font-semibold text-white bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
                <span>{destination?.stationName || 'Destination Station'}</span>
                {destination?.stationCode && (
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    {destination.stationCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sync Time Banner */}
          <div className="flex items-center gap-3.5 lg:self-center p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-base" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Last Socket Sync
              </div>
              <div className="font-mono font-semibold text-white text-sm">
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
