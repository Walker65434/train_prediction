import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faCircleCheck,
  faClock,
  faLocationDot,
  faFlagCheckered,
  faRoute,
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

  // If no detailed route halts exist in backend result, show standard Source -> Current -> Destination summary
  const hasRoute = Array.isArray(route) && route.length > 0;

  return (
    <div className="rounded-3xl border border-base-700/80 bg-base-900/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-800 pb-5 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FontAwesomeIcon icon={faRoute} className="text-primary text-lg" />
            <span>Station Timetable & Route Progression</span>
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Live schedule comparison with expected arrival and departure times
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-base-content/70">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Departed</span>
          </div>
          <div className="flex items-center gap-1.5 text-base-content/70">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5 text-base-content/70">
            <span className="w-2.5 h-2.5 rounded-full bg-base-700" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      {!hasRoute ? (
        // Summary 3-station layout if route array not detailed
        <div className="py-8 text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-2xl mx-auto">
            {/* Origin */}
            <div className="p-4 rounded-2xl bg-base-800/80 border border-base-700 w-full sm:w-1/3 text-center">
              <div className="badge badge-sm badge-outline mb-2">
                Origin Station
              </div>
              <div className="font-bold text-white text-base">
                {source?.stationName || 'Source'}
              </div>
              <div className="font-mono text-xs text-primary font-semibold">
                {source?.stationCode || 'SRC'}
              </div>
            </div>

            {/* Current */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 w-full sm:w-1/3 text-center relative">
              <div className="badge badge-sm badge-primary mb-2">
                Current Location
              </div>
              <div className="font-bold text-white text-base">
                {currStation?.stationName || 'In Transit'}
              </div>
              <div className="font-mono text-xs text-primary font-semibold">
                {currStation?.stationCode || 'NOW'}
              </div>
            </div>

            {/* Destination */}
            <div className="p-4 rounded-2xl bg-base-800/80 border border-base-700 w-full sm:w-1/3 text-center">
              <div className="badge badge-sm badge-outline mb-2">
                Final Destination
              </div>
              <div className="font-bold text-white text-base">
                {destination?.stationName || 'Destination'}
              </div>
              <div className="font-mono text-xs text-primary font-semibold">
                {destination?.stationCode || 'DST'}
              </div>
            </div>
          </div>
          <p className="text-xs text-base-content/50">
            Detailed intermediate halt timetable will update automatically as
            train advances.
          </p>
        </div>
      ) : (
        // Detailed station list
        <div className="relative overflow-x-auto">
          <div className="min-w-[600px] space-y-3">
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
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                      : isDeparted
                        ? 'bg-base-900/30 border-base-800/60 opacity-75'
                        : 'bg-base-900/50 border-base-800 hover:border-base-700'
                  }`}
                >
                  {/* Station Identity */}
                  <div className="flex items-center gap-3.5 w-1/3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${
                        isCurrent
                          ? 'bg-primary text-white shadow-md shadow-primary/30 animate-pulse'
                          : isDeparted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isLast
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-base-800 text-base-content/60'
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
                      <div className="font-bold text-white text-sm truncate flex items-center gap-2">
                        <span>
                          {station.stationName || `Station #${idx + 1}`}
                        </span>
                        {isCurrent && (
                          <span className="badge badge-xs badge-primary font-mono text-[9px] px-1 py-0.5">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-base-content/60">
                        {station.stationCode}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Times */}
                  <div className="w-1/4 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-base-content/50">
                      Scheduled
                    </div>
                    <div className="text-xs font-mono font-medium text-base-content/90 mt-0.5">
                      Arr: {formatTime(station.scheduledArrival)} | Dep:{' '}
                      {formatTime(station.scheduledDeparture)}
                    </div>
                  </div>

                  {/* Expected Times */}
                  <div className="w-1/4 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-base-content/50">
                      Expected / Actual
                    </div>
                    <div className="text-xs font-mono font-semibold text-white mt-0.5">
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

                  {/* Status Badge */}
                  <div className="w-1/6 text-right">
                    <span
                      className={`badge badge-sm font-mono text-[11px] font-medium tracking-wide ${
                        isCurrent
                          ? 'badge-primary'
                          : isDeparted
                            ? 'badge-success badge-outline'
                            : 'badge-neutral'
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
