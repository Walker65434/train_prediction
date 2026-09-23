import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faClockRotateLeft,
  faShareNodes,
  faTrain,
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

  const normalizedStatus = String(status || '').toUpperCase();
  const isRunning = normalizedStatus === TRAIN_STATUS.RUNNING;
  const isDelayed = normalizedStatus === TRAIN_STATUS.DELAYED;

  const badgeClassName =
    normalizedStatus === TRAIN_STATUS.RUNNING
      ? 'border-[#cfeadf] bg-[#edfaf3] text-[#2d9a6f]'
      : normalizedStatus === TRAIN_STATUS.DELAYED
        ? 'border-[#f7d9be] bg-[#fff2e3] text-[#c8772c]'
        : 'border-[#e7ded3] bg-[#fffaf5] text-[#5a5552]';

  return (
    <div className="rail-panel relative overflow-hidden p-5 sm:p-7">
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#f6d5c8]/70 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-[#f3e5d5]/80 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="rail-btn secondary w-fit">
            <FontAwesomeIcon icon={faArrowLeft} />
            Search another train
          </Link>

          <button type="button" onClick={handleShare} className="rail-btn secondary w-fit">
            <FontAwesomeIcon icon={faShareNodes} />
            Share link
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#1d1b1a] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                #{trainId}
              </span>
              <span className="rounded-full border border-[#eadfce] bg-[#fffaf5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a5552]">
                Live ETA stream
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${badgeClassName}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {status}
              </span>
            </div>

            <div>
              <h1 className="font-heading text-3xl font-black tracking-[-0.07em] text-[#1d1b1a] sm:text-4xl">
                {trainName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-full border border-[#e7ded3] bg-white/70 px-3 py-2 font-semibold text-[#1d1b1a]">
                <FontAwesomeIcon icon={faTrain} className="text-[#f05d3c]" />
                <span>{source?.stationName || 'Source Station'}</span>
                {source?.stationCode ? (
                  <span className="rounded-full bg-[#fff0eb] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f05d3c]">
                    {source.stationCode}
                  </span>
                ) : null}
              </div>

              <FontAwesomeIcon icon={faArrowRight} className="text-[#f05d3c]" />

              <div className="flex items-center gap-2 rounded-full border border-[#e7ded3] bg-white/70 px-3 py-2 font-semibold text-[#1d1b1a]">
                <span>{destination?.stationName || 'Destination Station'}</span>
                {destination?.stationCode ? (
                  <span className="rounded-full bg-[#eef3ff] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5076d5]">
                    {destination.stationCode}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[22px] border border-[#eadfce] bg-[#fffaf5] p-3 shadow-[0_10px_25px_rgba(36,30,24,0.04)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0eb] text-[#f05d3c]">
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#736d6a]">Last socket sync</div>
              <div className="mt-1 font-mono text-sm font-bold text-[#1d1b1a]">{formattedTime}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainHeaderCard;
