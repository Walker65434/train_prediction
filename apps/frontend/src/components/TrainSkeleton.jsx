import React from 'react';

export const TrainSkeleton = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl border border-base-700/60 bg-base-900/60 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-24 bg-base-700/80 rounded-full" />
              <div className="h-7 w-32 bg-base-700/60 rounded-full" />
            </div>
            <div className="h-9 w-64 sm:w-96 bg-base-700/80 rounded-xl" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-5 w-36 bg-base-800 rounded-lg" />
              <div className="h-4 w-4 bg-base-800 rounded-full" />
              <div className="h-5 w-40 bg-base-800 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:self-center">
            <div className="h-16 w-36 bg-base-800/80 rounded-2xl border border-base-700/50" />
            <div className="h-16 w-36 bg-base-800/80 rounded-2xl border border-base-700/50" />
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-base-700/50 bg-base-900/50 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-base-800 rounded" />
              <div className="h-8 w-8 bg-base-800 rounded-xl" />
            </div>
            <div className="h-8 w-36 bg-base-700/70 rounded-lg" />
            <div className="h-4 w-48 bg-base-800/70 rounded" />
          </div>
        ))}
      </div>

      {/* Timetable Schedule Skeleton */}
      <div className="rounded-3xl border border-base-700/60 bg-base-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-base-800 pb-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-base-700/80 rounded-lg" />
            <div className="h-4 w-64 bg-base-800 rounded" />
          </div>
          <div className="h-8 w-28 bg-base-800 rounded-lg" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-4 rounded-xl bg-base-800/40 border border-base-800/60"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-base-700/60 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 sm:w-48 bg-base-700/80 rounded" />
                  <div className="h-3 w-20 bg-base-800 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-4 w-16 bg-base-800 rounded hidden sm:block" />
                <div className="h-4 w-16 bg-base-800 rounded" />
                <div className="h-6 w-20 bg-base-700/60 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainSkeleton;
