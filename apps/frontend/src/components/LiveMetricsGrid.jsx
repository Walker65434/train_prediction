import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faClock,
  faGaugeHigh,
  faBrain,
  faArrowRight,
  faCircleCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

export const LiveMetricsGrid = ({ trainData }) => {
  if (!trainData) return null;

  const {
    currStation,
    nextStation,
    status = 'RUNNING',
    delayMin = 0,
    speed = 0,
    eta,
    prediction,
  } = trainData;

  const actualDelay =
    eta?.delayMinutes !== undefined ? eta.delayMinutes : delayMin;
  const isDelayed = actualDelay > 5;
  const isSeverelyDelayed = actualDelay > 30;

  // Format ETA arrival time
  const formatTime = (timeVal) => {
    if (!timeVal) return '--:--';
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) {
        // Might already be a string like "22:42"
        return String(timeVal);
      }
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(timeVal);
    }
  };

  const confidencePct = prediction?.confidence
    ? Math.round(
        prediction.confidence <= 1
          ? prediction.confidence * 100
          : prediction.confidence
      )
    : 92;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Station Progress */}
      <div className="rounded-2xl border border-base-700/80 bg-base-900/70 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-base-content/60 mb-2">
          <span className="font-semibold uppercase tracking-wider">
            Live Position
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FontAwesomeIcon icon={faLocationDot} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-base-content/60">Current Halt:</div>
          <div className="text-base font-bold text-white flex items-center gap-1.5 truncate">
            <span>
              {currStation?.stationName || currStation?.name || 'In Transit'}
            </span>
            {currStation?.stationCode && (
              <span className="badge badge-sm badge-neutral font-mono text-[10px]">
                {currStation.stationCode}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-base-800 flex items-center justify-between text-xs text-base-content/70">
          <span>Next:</span>
          <span className="font-medium text-white flex items-center gap-1 truncate max-w-[140px]">
            {nextStation?.stationName || nextStation?.name || 'Destination'}
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-[10px] text-primary"
            />
          </span>
        </div>
      </div>

      {/* 2. Delay & Train Status */}
      <div className="rounded-2xl border border-base-700/80 bg-base-900/70 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-accent/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-base-content/60 mb-2">
          <span className="font-semibold uppercase tracking-wider">
            Punctuality Status
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDelayed
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            <FontAwesomeIcon
              icon={isDelayed ? faTriangleExclamation : faCircleCheck}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tight flex items-baseline gap-1.5">
            {actualDelay <= 0 ? (
              <span className="text-emerald-400">Right Time</span>
            ) : (
              <span
                className={
                  isSeverelyDelayed
                    ? 'text-rose-400'
                    : isDelayed
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                }
              >
                +{actualDelay}{' '}
                <span className="text-xs font-normal">mins late</span>
              </span>
            )}
          </div>
          <div className="text-xs text-base-content/60">
            Current Status:{' '}
            <span className="font-mono font-semibold text-white uppercase">
              {status}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-base-800 flex items-center justify-between text-xs text-base-content/70">
          <span>Tolerance</span>
          <span className="text-xs font-medium text-base-content/90">
            {actualDelay <= 5 ? 'Minimal Delay' : 'Moderate Delay'}
          </span>
        </div>
      </div>

      {/* 3. Speedometer */}
      <div className="rounded-2xl border border-base-700/80 bg-base-900/70 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-info/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-base-content/60 mb-2">
          <span className="font-semibold uppercase tracking-wider">
            Current Velocity
          </span>
          <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
            <FontAwesomeIcon icon={faGaugeHigh} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
            <span>{speed || 0}</span>
            <span className="text-xs font-normal text-base-content/60">
              km/h
            </span>
          </div>
          <div className="text-xs text-base-content/60">
            {speed > 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Movement
              </span>
            ) : (
              <span className="text-base-content/50">Stationary at halt</span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-base-800 flex items-center justify-between text-xs text-base-content/70">
          <span>Max Track Speed</span>
          <span className="font-mono font-medium text-white">130 km/h</span>
        </div>
      </div>

      {/* 4. AI ETA & Prediction Confidence */}
      <div className="rounded-2xl border border-base-700/80 bg-base-900/70 p-5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-400/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-base-content/60 mb-2">
          <span className="font-semibold uppercase tracking-wider">
            AI ETA Prediction
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1.5">
            <span>{formatTime(eta?.arrivalTime || eta)}</span>
            <span className="text-[11px] font-mono font-normal text-purple-400">
              {prediction?.modelVersion || 'ML-v1.4'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-base-content/70">
            <span>Confidence:</span>
            <span className="font-mono font-bold text-purple-300">
              {confidencePct}%
            </span>
          </div>
        </div>

        {/* Confidence progress bar */}
        <div className="mt-2.5 w-full bg-base-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveMetricsGrid;
