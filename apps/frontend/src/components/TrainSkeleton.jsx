import React from 'react';

export const TrainSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Top Header Banner Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-24 bg-slate-200 rounded-xl" />
              <div className="h-7 w-32 bg-slate-200/70 rounded-xl" />
            </div>
            <div className="h-10 w-64 sm:w-96 bg-slate-200 rounded-2xl" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-7 w-36 bg-slate-200/80 rounded-xl" />
              <div className="h-4 w-4 bg-slate-200 rounded-full" />
              <div className="h-7 w-40 bg-slate-200/80 rounded-xl" />
            </div>
          </div>

          <div className="h-16 w-44 bg-slate-200/80 rounded-2xl border border-slate-200 lg:self-center" />
        </div>
      </div>

      {/* 4 Metric Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200 bg-white/50 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded-lg" />
              <div className="h-9 w-9 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-8 w-36 bg-slate-200 rounded-xl" />
            <div className="h-4 w-48 bg-slate-200/60 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Timetable Schedule Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white/50 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-slate-200 rounded-xl" />
            <div className="h-4 w-72 bg-slate-200/60 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-36 sm:w-48 bg-slate-200 rounded-lg" />
                  <div className="h-3 w-24 bg-slate-200/60 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-4 w-20 bg-slate-200 rounded hidden sm:block" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-20 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainSkeleton;
