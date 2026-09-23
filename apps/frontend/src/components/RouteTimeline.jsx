import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faCircleCheck,
  faClock,
  faLocationDot,
  faFlagCheckered,
  faRoute,
  faBuildingColumns,
} from '@fortawesome/free-solid-svg-icons';

export const RouteTimeline = ({
  route = [],
  source,
  destination,
  currStation,
}) => {
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

  const hasRoute = Array.isArray(route) && route.length > 0;

  // Calculate overall route completion percentage dynamically
  let routeProgressPct = 0;
  if (hasRoute) {
    const currentIdx = route.findIndex(
      (s) =>
        s.status === 'CURRENT' || s.stationCode === currStation?.stationCode
    );
    if (currentIdx >= 0) {
      routeProgressPct = Math.round(((currentIdx + 1) / route.length) * 100);
    } else {
      const departedCount = route.filter((s) => s.status === 'DEPARTED').length;
      routeProgressPct = Math.round((departedCount / route.length) * 100);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 font-heading">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faRoute} className="text-lg" />
            </div>
            <span>Station Timetable & Route Progression</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time schedule comparison with predicted arrival & departure
            timestamps
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs bg-slate-950/70 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Departed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      {hasRoute && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Overall Route Progression</span>
            <span className="font-mono text-cyan-400 font-bold">
              {routeProgressPct}% Completed
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-linear-to-r from-emerald-500 via-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${routeProgressPct}%` }}
            />
          </div>
        </div>
      )}

      {!hasRoute ? (
        // Summary 3-station layout if route array not detailed
        <div className="py-8 text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
            {/* Origin */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 w-full sm:w-1/3 text-center space-y-1 shadow-inner">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-semibold text-slate-400 uppercase">
                Origin Station
              </span>
              <div className="font-bold text-white text-base font-heading">
                {source?.stationName || 'Source'}
              </div>
              <div className="font-mono text-xs text-cyan-400 font-bold">
                {source?.stationCode || 'SRC'}
              </div>
            </div>

            {/* Current */}
            <div className="p-5 rounded-2xl bg-linear-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 w-full sm:w-1/3 text-center space-y-1 relative shadow-lg shadow-cyan-500/5">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                Current Position
              </span>
              <div className="font-bold text-white text-base font-heading flex items-center justify-center gap-1.5">
                <FontAwesomeIcon
                  icon={faTrain}
                  className="text-cyan-400 text-xs animate-pulse"
                />
                <span>{currStation?.stationName || 'In Transit'}</span>
              </div>
              <div className="font-mono text-xs text-cyan-300 font-bold">
                {currStation?.stationCode || 'LIVE'}
              </div>
            </div>

            {/* Destination */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 w-full sm:w-1/3 text-center space-y-1 shadow-inner">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-semibold text-slate-400 uppercase">
                Final Destination
              </span>
              <div className="font-bold text-white text-base font-heading">
                {destination?.stationName || 'Destination'}
              </div>
              <div className="font-mono text-xs text-indigo-400 font-bold">
                {destination?.stationCode || 'DST'}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Intermediate halt timetable stream will update automatically as
            train advances.
          </p>
        </div>
      ) : (
        // Detailed station list
        <div className="relative overflow-x-auto">
          <div className="min-w-162.5 space-y-2.5 pt-2">
            {route.map((station, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === route.length - 1;
              const isCurrent =
                station.status === 'CURRENT' ||
                station.stationCode === currStation?.stationCode;
              const isDeparted = station.status === 'DEPARTED';

              return (
                <div
                  key={station.stationCode || idx}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-linear-to-r from-cyan-500/10 via-indigo-500/10 to-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : isDeparted
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Station Identity */}
                  <div className="flex items-center gap-3.5 w-2/5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                        isCurrent
                          ? 'bg-linear-to-tr from-cyan-500 to-indigo-600 text-white shadow-cyan-500/30 animate-pulse'
                          : isDeparted
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isLast
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <FontAwesomeIcon icon={faTrain} />
                      ) : isDeparted ? (
                        <FontAwesomeIcon icon={faCircleCheck} />
                      ) : isLast ? (
                        <FontAwesomeIcon icon={faFlagCheckered} />
                      ) : (
                        <span className="font-mono text-xs">{idx + 1}</span>
                      )}
                    </div>

                    <div className="truncate">
                      <div className="font-bold text-white text-sm truncate flex items-center gap-2 font-heading">
                        <span className="truncate">
                          {station.stationName || `Station #${idx + 1}`}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-[9px] font-black tracking-wider shrink-0">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-400 font-semibold">
                          {station.stationCode}
                        </span>
                        {station.platform && (
                          <span className="text-[10px] text-slate-500">
                            PF #{station.platform}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Times */}
                  <div className="w-1/4 text-center">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Scheduled
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-300 mt-1">
                      Arr: {formatTime(station.scheduledArrival)} | Dep:{' '}
                      {formatTime(station.scheduledDeparture)}
                    </div>
                  </div>

                  {/* Expected / Actual Times */}
                  <div className="w-1/4 text-center">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Expected / Actual
                    </div>
                    <div className="text-xs font-mono font-bold text-white mt-1">
                      Arr:{' '}
                      {formatTime(
                        station.expectedArrival || station.scheduledArrival
                      )}{' '}
                      | Dep:{' '}
                      {formatTime(
                        station.expectedDeparture || station.scheduledDeparture
                      )}
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="w-1/6 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase border shadow-sm ${
                        isCurrent
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40'
                          : isDeparted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      {station.status ||
                        (isCurrent
                          ? 'CURRENT'
                          : isDeparted
                            ? 'DEPARTED'
                            : 'UPCOMING')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteTimeline;
