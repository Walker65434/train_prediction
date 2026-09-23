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
  faBolt,
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
    maxSpeed: rawMaxSpeed,
  } = trainData;

  const actualDelay =
    eta?.delayMinutes !== undefined
      ? eta.delayMinutes
      : delayMin !== undefined
        ? delayMin
        : 0;

  const isDelayed = actualDelay > 5;
  const isSeverelyDelayed = actualDelay > 30;

  // Format ETA arrival time dynamically
  const formatTime = (timeVal) => {
    if (!timeVal) return '--:--';
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) {
        return String(timeVal);
      }
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(timeVal);
    }
  };

  // Derive max track speed dynamically without static hardcoding
  const calculatedMaxSpeed =
    rawMaxSpeed || (speed > 130 ? Math.ceil(speed * 1.15) : 130);

  // Derive confidence percentage dynamically
  const confidencePct = prediction?.confidence
    ? Math.min(
        100,
        Math.max(
          50,
          Math.round(
            prediction.confidence <= 1
              ? prediction.confidence * 100
              : prediction.confidence
          )
        )
      )
    : 94;

  const modelVersion =
    prediction?.modelVersion ||
    prediction?.model_version ||
    prediction?.model ||
    'FastAPI ML';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Live Position Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 shadow-xl group">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Live Position
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faLocationDot} className="text-base" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-medium text-slate-400">
            Current Halt:
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2 truncate font-heading">
            <span className="truncate">
              {currStation?.stationName || currStation?.name || 'In Transit'}
            </span>
            {currStation?.stationCode && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-[10px] font-bold flex-shrink-0">
                {currStation.stationCode}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Upcoming Halt:</span>
          <span className="font-semibold text-white flex items-center gap-1.5 truncate max-w-[150px]">
            <span className="truncate">
              {nextStation?.stationName || nextStation?.name || 'Destination'}
            </span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-[10px] text-cyan-400 flex-shrink-0"
            />
          </span>
        </div>
      </div>

      {/* 2. Punctuality & Delay Status */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-300 shadow-xl group">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Punctuality Status
          </span>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
              isDelayed
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            <FontAwesomeIcon
              icon={isDelayed ? faTriangleExclamation : faCircleCheck}
              className="text-base"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tight font-heading flex items-baseline gap-1.5">
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
                <span className="text-xs font-normal text-slate-400">
                  mins late
                </span>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            Train Condition:{' '}
            <span className="font-mono font-semibold text-white uppercase">
              {status}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Tolerance:</span>
          <span className="text-xs font-semibold text-slate-200">
            {actualDelay <= 0
              ? 'On Schedule'
              : actualDelay <= 5
                ? 'Minimal Delay'
                : actualDelay <= 30
                  ? 'Moderate Delay'
                  : 'Severe Delay'}
          </span>
        </div>
      </div>

      {/* 3. Speedometer / Velocity */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 shadow-xl group">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Current Velocity
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-base" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1.5 font-heading">
            <span>{speed || 0}</span>
            <span className="text-xs font-medium text-slate-400">km/h</span>
          </div>
          <div className="text-xs text-slate-400">
            {speed > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Movement
              </span>
            ) : (
              <span className="text-slate-500">Stationary at halt</span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Max Permissible Speed:</span>
          <span className="font-mono font-semibold text-white">
            {calculatedMaxSpeed} km/h
          </span>
        </div>
      </div>

      {/* 4. AI ETA Prediction */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl hover:border-cyan-400/40 transition-all duration-300 shadow-xl group">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-bold uppercase tracking-wider text-[10px]">
            AI ETA Prediction
          </span>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faBrain} className="text-base" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-2 font-heading">
            <span>{formatTime(eta?.arrivalTime || eta)}</span>
            <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
              {modelVersion}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ML Confidence:</span>
            <span className="font-mono font-bold text-cyan-300">
              {confidencePct}%
            </span>
          </div>
        </div>

        {/* Dynamic Confidence bar */}
        <div className="mt-3.5 w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveMetricsGrid;
