import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrain,
  faArrowLeft,
  faRotateRight,
  faTriangleExclamation,
  faHourglassHalf,
  faBolt,
  faSignal,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

import { useTrainStore } from '../store/useTrainStore';
import { startWatchSession, fetchTrainResult } from '../lib/api';
import {
  getSocket,
  joinTrainWatch,
  leaveTrainWatch,
  startHeartbeat,
  stopHeartbeat,
} from '../lib/socket';
import { STATUS, STOP_REASON } from '@repo/constants/watch';

import TrainSkeleton from '../components/TrainSkeleton';
import TrainHeaderCard from '../components/TrainHeaderCard';
import LiveMetricsGrid from '../components/LiveMetricsGrid';
import RouteTimeline from '../components/RouteTimeline';

export const TrackPage = () => {
  const { trainId } = useParams();

  const {
    trainData,
    watchId,
    isLoading,
    isLiveConnected,
    lastUpdated,
    errorMessage,
    setTrainId,
    setWatchSession,
    setTrainData,
    updateEtaData,
    setLoading,
    setLiveConnected,
    setHeartbeatAck,
    setError,
    clearWatch,
    addRecentSearch,
    setWatchStatus,
  } = useTrainStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeWatchIdRef = useRef(null);

  useEffect(() => {
    if (!trainId) return;

    let isMounted = true;
    const cleanTrainId = String(trainId).trim();

    setTrainId(cleanTrainId);
    setLoading(true);

    const initTracking = async () => {
      try {
        // 1. Start Watch Session via HTTP POST /watch
        console.log(
          `[TrackPage] Starting watch session for train: ${cleanTrainId}`
        );
        const watchRes = await startWatchSession(cleanTrainId);

        if (!isMounted) return;

        const currentWatchId = watchRes.watchId;
        activeWatchIdRef.current = currentWatchId;
        setWatchSession(currentWatchId, cleanTrainId);

        // 2. Fetch Initial Saved Result from MongoDB via GET /result/:trainId
        try {
          const resultRes = await fetchTrainResult(cleanTrainId);
          if (isMounted && resultRes?.result) {
            setTrainData(resultRes.result);
            if (resultRes.result.trainName) {
              addRecentSearch(cleanTrainId, resultRes.result.trainName);
            }
          }
        } catch (fetchErr) {
          // 404 is normal if train is being watched for the first time & ML hasn't emitted yet
          console.log(
            '[TrackPage] No existing result in DB yet. Waiting for ML live stream...'
          );
          if (isMounted) {
            // Provide a graceful starting shell
            setTrainData({
              trainId: cleanTrainId,
              trainName: `Train #${cleanTrainId}`,
              status: 'RUNNING',
              delayMin: 0,
              speed: 0,
              eta: { delayMinutes: 0 },
              currStation: { stationName: 'Calculating Live Location...' },
              nextStation: { stationName: 'Upcoming Halt' },
              route: [],
              prediction: { modelVersion: 'FastAPI ML', confidence: 0.94 },
            });
          }
        }

        // 3. Connect to Socket.IO & join train room
        const socket = getSocket();

        const onConnect = () => {
          if (isMounted) setLiveConnected(true);
        };

        const onDisconnect = () => {
          if (isMounted) {
            setLiveConnected(false);
            setWatchStatus(STATUS.STOPPED);
          }
        };

        const onEtaUpdate = (payload) => {
          console.log('[TrackPage] Received live eta-update:', payload);
          if (!isMounted) return;
          updateEtaData(payload);
          toast.success('Live ETA update received!', {
            id: 'eta-update-toast',
            duration: 2500,
            icon: '⚡',
          });
        };

        const onHeartbeatAck = (data) => {
          if (isMounted && data?.timestamp) {
            setHeartbeatAck(data.timestamp);
          }
        };

        const onWatchStarted = (data) => {
          console.log(
            '[TrackPage] Watch started acknowledged by server:',
            data
          );
        };

        const onError = (err) => {
          console.warn('[TrackPage] Socket warning:', err);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('eta-update', onEtaUpdate);
        socket.on('heartbeat-ack', onHeartbeatAck);
        socket.on('watch-started', onWatchStarted);
        socket.on('error', onError);

        // Join room & start heartbeat
        joinTrainWatch(currentWatchId, cleanTrainId);
        if (socket.connected) {
          setLiveConnected(true);
        }

        return () => {
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('eta-update', onEtaUpdate);
          socket.off('heartbeat-ack', onHeartbeatAck);
          socket.off('watch-started', onWatchStarted);
          socket.off('error', onError);
        };
      } catch (err) {
        console.error('[TrackPage] Initialization error:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to connect to train tracking service'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    let cleanupSocketListeners;
    initTracking().then((cleanupFn) => {
      cleanupSocketListeners = cleanupFn;
    });

    // Cleanup on unmount or when trainId changes
    return () => {
      isMounted = false;
      const currentWatchId = activeWatchIdRef.current;
      if (currentWatchId) {
        console.log(
          `[TrackPage] Unmounting: leaving watch session ${currentWatchId}`
        );
        leaveTrainWatch(currentWatchId);
      }
      if (cleanupSocketListeners) {
        cleanupSocketListeners();
      }
      clearWatch();
    };
  }, [trainId]);

  // Manual refresh trigger
  const handleManualRefresh = async () => {
    if (!trainId) return;
    setIsRefreshing(true);
    try {
      const resultRes = await fetchTrainResult(trainId);
      if (resultRes?.result) {
        setTrainData(resultRes.result);
        toast.success('Train status refreshed', { icon: '🔄' });
      }
    } catch (e) {
      toast('No new snapshot in DB yet. Real-time stream active.', {
        icon: 'ℹ️',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Loading Skeleton */}
      {isLoading ? (
        <TrainSkeleton />
      ) : errorMessage ? (
        // Error State
        <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl border border-rose-500/30 bg-slate-900/90 text-center space-y-4 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">
            Tracking Session Error
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            {errorMessage}
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Return Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faRotateRight} /> Retry Connection
            </button>
          </div>
        </div>
      ) : (
        // Live Data View
        <div className="space-y-6">
          {/* Header Card */}
          <TrainHeaderCard trainData={trainData} lastUpdated={lastUpdated} />

          {/* Real-time Socket Stream Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs shadow-md backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-slate-300 font-medium">
                {isLiveConnected
                  ? 'Persistent WebSocket stream active. Receiving live ML delay updates.'
                  : 'Re-establishing live WebSocket connection...'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 self-end sm:self-auto shadow-sm"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={`text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Refresh Snapshot</span>
            </button>
          </div>

          {/* 4 Metric Cards */}
          <LiveMetricsGrid trainData={trainData} />

          {/* Route Progression Timetable */}
          <RouteTimeline
            route={trainData?.route || []}
            source={trainData?.source}
            destination={trainData?.destination}
            currStation={trainData?.currStation}
          />
        </div>
      )}
    </div>
  );
};

export default TrackPage;
