import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBrain,
  faCircleCheck,
  faGaugeHigh,
  faLocationDot,
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

  const formatTime = (timeVal) => {
    if (!timeVal) return '--:--';
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) return String(timeVal);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(timeVal);
    }
  };

  const calculatedMaxSpeed =
    rawMaxSpeed || (speed > 130 ? Math.ceil(speed * 1.15) : 130);

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rail-metric-card">
        <div className="flex items-center justify-between">
          <span className="metric-label">Live position</span>
          <div className="metric-icon warm">
            <FontAwesomeIcon icon={faLocationDot} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current halt</div>
          <div className="mt-2 flex items-center gap-2 text-xl font-black tracking-[-0.06em] text-slate-900">
            <span>{currStation?.stationName || currStation?.name || 'In Transit'}</span>
            {currStation?.stationCode ? (
              <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">
                {currStation.stationCode}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
          <span>Upcoming halt</span>
          <span className="flex items-center gap-1 font-semibold text-slate-900">
            {nextStation?.stationName || nextStation?.name || 'Destination'}
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-orange-500" />
          </span>
        </div>
      </div>

      <div className="rail-metric-card">
        <div className="flex items-center justify-between">
          <span className="metric-label">Punctuality</span>
          <div className={`metric-icon ${isDelayed ? 'amber' : 'green'}`}>
            <FontAwesomeIcon icon={isDelayed ? faTriangleExclamation : faCircleCheck} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black tracking-[-0.06em] text-slate-900">
            {actualDelay <= 0 ? (
              <span className="text-emerald-500">On time</span>
            ) : (
              <span className={isSeverelyDelayed ? 'text-red-500' : isDelayed ? 'text-amber-500' : 'text-emerald-500'}>
                +{actualDelay}{' '}
                <span className="text-sm font-medium text-slate-500">mins late</span>
              </span>
            )}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Train condition: {status}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
          <span>Performance</span>
          <span className="font-semibold text-slate-900">
            {actualDelay <= 0 ? 'On schedule' : actualDelay <= 5 ? 'Minimal delay' : actualDelay <= 30 ? 'Moderate delay' : 'Severe delay'}
          </span>
        </div>
      </div>

      <div className="rail-metric-card">
        <div className="flex items-center justify-between">
          <span className="metric-label">Velocity</span>
          <div className="metric-icon blue">
            <FontAwesomeIcon icon={faGaugeHigh} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black tracking-[-0.06em] text-slate-900">
            {speed || 0} <span className="text-sm font-medium text-slate-500">km/h</span>
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            {speed > 0 ? 'Active movement' : 'Stationary at halt'}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
          <span>Max speed</span>
          <span className="font-semibold text-slate-900">{calculatedMaxSpeed} km/h</span>
        </div>
      </div>

      <div className="rail-metric-card">
        <div className="flex items-center justify-between">
          <span className="metric-label">AI ETA</span>
          <div className="metric-icon orange">
            <FontAwesomeIcon icon={faBrain} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black tracking-[-0.06em] text-slate-900">
            {formatTime(eta?.arrivalTime || eta)}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            {modelVersion}
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>ML confidence</span>
            <span className="font-semibold text-slate-900">{confidencePct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 border border-slate-200">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#ea580c_0%,#f97316_45%,#f59e0b_100%)]" style={{ width: `${confidencePct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMetricsGrid;
