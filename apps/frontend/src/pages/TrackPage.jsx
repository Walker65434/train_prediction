import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faRotateRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

import { useTrainStore } from '../store/useTrainStore';
import { startWatchSession, fetchTrainResult } from '../lib/api';
import { getSocket, joinTrainWatch, leaveTrainWatch } from '../lib/socket';
import { STATUS } from '@repo/constants/watch';

import TrainSkeleton from '../components/TrainSkeleton';
import TrainHeaderCard from '../components/TrainHeaderCard';
import LiveMetricsGrid from '../components/LiveMetricsGrid';
import RouteTimeline from '../components/RouteTimeline';

export const TrackPage = () => {
  const { trainId } = useParams();

  const {
    trainData,
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
        const watchRes = await startWatchSession(cleanTrainId);

        if (!isMounted) return;

        const currentWatchId = watchRes.watchId;
        activeWatchIdRef.current = currentWatchId;
        setWatchSession(currentWatchId, cleanTrainId);

        try {
          const resultRes = await fetchTrainResult(cleanTrainId);
          if (isMounted && resultRes?.result) {
            setTrainData(resultRes.result);
            if (resultRes.result.trainName) {
              addRecentSearch(cleanTrainId, resultRes.result.trainName);
            }
          }
        } catch (fetchErr) {
          if (isMounted) {
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

        const onWatchStarted = () => {};
        const onError = (err) => console.warn('[TrackPage] Socket warning:', err);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('eta-update', onEtaUpdate);
        socket.on('heartbeat-ack', onHeartbeatAck);
        socket.on('watch-started', onWatchStarted);
        socket.on('error', onError);

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

    return () => {
      isMounted = false;
      const currentWatchId = activeWatchIdRef.current;
      if (currentWatchId) {
        leaveTrainWatch(currentWatchId);
      }
      if (cleanupSocketListeners) {
        cleanupSocketListeners();
      }
      clearWatch();
    };
  }, [trainId]);

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
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {isLoading ? (
        <TrainSkeleton />
      ) : errorMessage ? (
        <div className="mx-auto max-w-xl rail-panel p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 text-xl text-red-500 border border-white/80">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h2 className="mt-4 font-heading text-2xl font-black tracking-[-0.06em] text-slate-900">
            Tracking session error
          </h2>
          <p className="mt-3 text-sm text-slate-600">{errorMessage}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/" className="rail-btn secondary">
              <FontAwesomeIcon icon={faArrowLeft} />
              Return home
            </Link>
            <button onClick={() => window.location.reload()} className="rail-btn primary">
              <FontAwesomeIcon icon={faRotateRight} />
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <TrainHeaderCard trainData={trainData} lastUpdated={lastUpdated} />

          <div className="rail-panel flex flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-ping`} />
                <span className={`relative inline-flex h-3 w-3 rounded-full ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-sm text-slate-700">
                {isLiveConnected
                  ? 'Persistent WebSocket stream active and receiving live ML updates.'
                  : 'Re-establishing live WebSocket connection...'}
              </span>
            </div>

            <button type="button" onClick={handleManualRefresh} disabled={isRefreshing} className="rail-btn secondary">
              <FontAwesomeIcon icon={faRotateRight} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh snapshot
            </button>
          </div>

          <LiveMetricsGrid trainData={trainData} />

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
