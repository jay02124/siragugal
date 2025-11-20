import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import TrackPlayer, { Capability, Event, State } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLiveBroadcast } from '../services/api/LiveBroadcast/getLiveBroadcast';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferingTrackId, setBufferingTrackId] = useState(null);
  const [trackList, setTrackList] = useState([]);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const trackPlayerInitialized = useRef(false);
  const pausedPositions = useRef({});
  const lastAutoPlayRef = useRef(null); //  <-- prevents infinite auto-play loop

  // ------------------------------------------------------------
  // Initialize TrackPlayer
  // ------------------------------------------------------------
  const initializeTrackPlayer = useCallback(async () => {
    if (trackPlayerInitialized.current) return;

    try {
      await TrackPlayer.setupPlayer();
      trackPlayerInitialized.current = true;

      await TrackPlayer.updateOptions({
        stopWithApp: true,
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        compactCapabilities: [Capability.Play, Capability.Pause],
        ongoing: true,
      });
    } catch (error) {
      console.error('TrackPlayer init error:', error);
      trackPlayerInitialized.current = false;
    }
  }, []);

  // ------------------------------------------------------------
  // Fetch FM Stream Data
  // ------------------------------------------------------------
  const getFMStreamData = async () => {
    try {
      const response = await getLiveBroadcast();
      const live = response?.data?.[0];

      if (!live?.broadcast_link) return null;

      return {
        id: 'fm-stream',
        type: 'fm',
        url: live.broadcast_link,
        title: live.broadcast_title || 'SIRAGUGAL FM',
        artist: 'Siragugal FM',
        artwork: require('../../assets/logo/logo.png'),
      };
    } catch (e) {
      console.log('FM Stream Fetch Error:', e);
      return null;
    }
  };

  // ------------------------------------------------------------
  // Event Listener: Playback State
  // ------------------------------------------------------------
  useEffect(() => {
    let subState, subErr, subPlay, subPause, subStop;

    (async () => {
      await initializeTrackPlayer();
      setPlayerReady(true);

      subState = TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
        const state = event.state;

        // --------------------------------------------------------------
        // AUTO-PLAY FM WHEN PODCAST IS PAUSED / STOPPED
        // --------------------------------------------------------------
        if (
          (state === State.Paused || state === State.Stopped) &&
          currentTrack?.type === 'podcast'
        ) {
          const now = Date.now();

          // prevent double triggering within 2 sec
          if (lastAutoPlayRef.current && now - lastAutoPlayRef.current < 2000) {
            return;
          }
          lastAutoPlayRef.current = now;

          console.log("Podcast paused/stopped → Auto-playing FM");

          // DO NOT autoplay FM if FM is already active
          const active = await TrackPlayer.getActiveTrack();
          if (active?.id === 'fm-stream') {
            return;
          }

          const fmTrack = await getFMStreamData();
          if (fmTrack) {
            await playTrack(fmTrack);
            return;
          }
        }

        // --------------------------------------------------------------
        // NORMAL STATE BEHAVIOR
        // --------------------------------------------------------------
        if (state === State.Playing) {
          setIsPlaying(true);
          setIsBuffering(false);
        } else if (
          state === State.Paused ||
          state === State.Stopped ||
          state === State.Ready
        ) {
          setIsPlaying(false);
          setIsBuffering(false);
          setBufferingTrackId(null);
        }

        if (state === State.Buffering || state === State.Connecting) {
          setIsBuffering(true);
        }
      });

      subErr = TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
        console.error('Playback Error:', event);
        setIsBuffering(false);
        setBufferingTrackId(null);
      });

      subPlay = TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        try {
          await TrackPlayer.play();
          setIsPlaying(true);
        } catch (e) {
          console.error('RemotePlay Error:', e);
        }
      });

      subPause = TrackPlayer.addEventListener(Event.RemotePause, async () => {
        try {
          await TrackPlayer.pause();
          setIsPlaying(false);
        } catch (e) {
          console.error('RemotePause Error:', e);
        }
      });

      subStop = TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        try {
          await TrackPlayer.stop();
          setIsPlaying(false);
          setCurrentTrack(null);
        } catch (e) {
          console.error('RemoteStop Error:', e);
        }
      });
    })();

    return () => {
      subState?.remove();
      subErr?.remove();
      subPlay?.remove();
      subPause?.remove();
      subStop?.remove();
    };
  }, [initializeTrackPlayer, currentTrack]);

  // ------------------------------------------------------------
  // Auto-Play FM on App Startup
  // ------------------------------------------------------------
  useEffect(() => {
    const autoPlayFM = async () => {
      if (!playerReady) return;
      if (hasPlayedOnce) return; // only once
      if (currentTrack) return;  // something else playing

      const fmTrack = await getFMStreamData();
      if (fmTrack) {
        await playTrack(fmTrack);
        setHasPlayedOnce(true);
      }
    };

    autoPlayFM();
  }, [playerReady]);

  // ------------------------------------------------------------
  // PLAY TRACK
  // ------------------------------------------------------------
  const playTrack = useCallback(
    async (track, options = {}) => {
      try {
        await initializeTrackPlayer();

        // Save last podcast progress
        if (currentTrack?.type === 'podcast') {
          try {
            const position = await TrackPlayer.getPosition();
            pausedPositions.current[currentTrack.id] = position;

            await AsyncStorage.setItem(
              `podcast_position_${currentTrack.id}`,
              JSON.stringify({ position, timestamp: Date.now() })
            );
          } catch (e) {}
        }

        const normalizedTrack = {
          ...track,
          id:
            track.id?.toString() ||
            track._id?.toString() ||
            track.id ||
            `id-${Date.now()}`,
        };

        setBufferingTrackId(normalizedTrack.id);
        setIsBuffering(true);

        // Clear queue
        const queue = await TrackPlayer.getQueue();
        if (queue.length > 0) await TrackPlayer.reset();

        await TrackPlayer.add(normalizedTrack);

        // Resume logic
        if (options.position !== undefined) {
          await TrackPlayer.seekTo(options.position);
        } else if (pausedPositions.current[normalizedTrack.id] !== undefined) {
          await TrackPlayer.seekTo(pausedPositions.current[normalizedTrack.id]);
        } else {
          const saved = await AsyncStorage.getItem(
            `podcast_position_${normalizedTrack.id}`
          );

          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.position !== undefined) {
              pausedPositions.current[normalizedTrack.id] = parsed.position;
              await TrackPlayer.seekTo(parsed.position);
            }
          }
        }

        await TrackPlayer.play();
        setHasPlayedOnce(true);
        setCurrentTrack(normalizedTrack);
        setIsPlaying(true);
      } catch (e) {
        console.error('Play Error:', e);
        setIsBuffering(false);
        setBufferingTrackId(null);
      }
    },
    [initializeTrackPlayer, currentTrack]
  );

  // ------------------------------------------------------------
  // PAUSE
  // ------------------------------------------------------------
  const pausePlayback = useCallback(async () => {
    try {
      const position = await TrackPlayer.getPosition();
      if (currentTrack?.type === 'podcast') {
        pausedPositions.current[currentTrack.id] = position;

        await AsyncStorage.setItem(
          `podcast_position_${currentTrack.id}`,
          JSON.stringify({ position, timestamp: Date.now() })
        );
      }

      await TrackPlayer.pause();
      setIsPlaying(false);
    } catch (e) {
      console.error('Pause Error:', e);
    }
  }, [currentTrack]);

  // ------------------------------------------------------------
  // RESUME
  // ------------------------------------------------------------
  const resumePlayback = useCallback(async () => {
    if (!currentTrack) return;
    try {
      await initializeTrackPlayer();
      await TrackPlayer.play();
      setHasPlayedOnce(true);
      setIsPlaying(true);
    } catch (e) {
      console.error('Resume Error:', e);
    }
  }, [currentTrack, initializeTrackPlayer]);

  // ------------------------------------------------------------
  // STOP
  // ------------------------------------------------------------
  const stopPlayback = useCallback(async () => {
    try {
      await TrackPlayer.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
      setIsBuffering(false);
      setBufferingTrackId(null);
    } catch (e) {
      console.error('Stop Error:', e);
    }
  }, []);

  // ------------------------------------------------------------
  // PODCAST STORAGE
  // ------------------------------------------------------------
  const getLastPausedPodcast = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('lastPodcast');
      return data ? JSON.parse(data) : null;
    } catch (_) {
      return null;
    }
  }, []);

  const saveLastPodcast = useCallback(async (info) => {
    try {
      await AsyncStorage.setItem('lastPodcast', JSON.stringify(info));
    } catch (_) {}
  }, []);

  const clearSavedPodcast = useCallback(async (podcastId) => {
    try {
      delete pausedPositions.current[podcastId];
      await AsyncStorage.removeItem(`podcast_position_${podcastId}`);
    } catch (_) {}
  }, []);

  // ------------------------------------------------------------
  // UPDATE METADATA
  // ------------------------------------------------------------
  const updateCurrentTrackMetadata = useCallback(async (metadata) => {
    if (!currentTrack) return;

    const updated = { ...currentTrack, ...metadata };
    setCurrentTrack(updated);

    try {
      await TrackPlayer.updateMetadataForTrack(0, updated);
    } catch (e) {
      console.error('Metadata Update Error:', e);
    }
  }, [currentTrack?.id]);

  // ------------------------------------------------------------
  // EXPORT CONTEXT
  // ------------------------------------------------------------
  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        bufferingTrackId,

        trackList,
        setTrackList,

        playTrack,
        pausePlayback,
        resumePlayback,
        stopPlayback,

        getLastPausedPodcast,
        saveLastPodcast,
        clearSavedPodcast,

        updateCurrentTrackMetadata,

        defaultTrack: {
          id: 'fm-stream',
          type: 'fm',
          title: 'SIRAGUGAL CRS FM 89.6 MHz',
          artist: 'SIRAGUGAL CRS FM',
        },

        getDefaultFMTrack: getFMStreamData,

        pausedPositions: pausedPositions.current,
        hasPlayedOnce,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
