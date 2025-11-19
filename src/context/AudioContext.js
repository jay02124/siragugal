import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import TrackPlayer, { Capability, Event, State } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferingTrackId, setBufferingTrackId] = useState(null);
  const [trackList, setTrackList] = useState([]);
  const trackPlayerInitialized = useRef(false);
  const pausedPositions = useRef({}); // Store paused positions for resume functionality

  // Initialize TrackPlayer
  const initializeTrackPlayer = useCallback(async () => {
    if (trackPlayerInitialized.current) {
      return;
    }

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

      // Set up event listeners
      const playbackStateSubscription = TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
        setIsPlaying(event.state === State.Playing);
        setIsBuffering(event.state === State.Buffering);
      });

      const playbackErrorSubscription = TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
        console.error('Playback error:', event);
        setIsBuffering(false);
      });

      const remotePlaySubscription = TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        await TrackPlayer.play();
      });

      const remotePauseSubscription = TrackPlayer.addEventListener(Event.RemotePause, async () => {
        await TrackPlayer.pause();
      });

      const remoteStopSubscription = TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        await TrackPlayer.stop();
      });

      return () => {
        playbackStateSubscription.remove();
        playbackErrorSubscription.remove();
        remotePlaySubscription.remove();
        remotePauseSubscription.remove();
        remoteStopSubscription.remove();
      };
    } catch (error) {
      console.error('Error initializing TrackPlayer:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initializeTrackPlayer();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [initializeTrackPlayer]);

  // Get default FM track
  const getDefaultFMTrack = useCallback((broadwaveUrl, liveBroadcastTitle) => ({
    id: 'fm-stream',
    type: 'fm',
    url: broadwaveUrl,
    title: liveBroadcastTitle || 'SIRAGUGAL CRS FM 89.6 MHz',
    artist: 'SIRAGUGAL CRS FM',
    artwork: require('../../assets/logo/logo.png'),
  }), []);

  // Play track
  const playTrack = useCallback(async (track, options = {}) => {
    try {
      setBufferingTrackId(track.id);
      setIsBuffering(true);

      // Stop current playback and clear queue
      const queue = await TrackPlayer.getQueue();
      if (queue.length > 0) {
        await TrackPlayer.reset();
      }

      // Add track and play
      await TrackPlayer.add(track);
      
      // Handle resume position
      if (options.position !== undefined) {
        await TrackPlayer.seekTo(options.position);
      } else if (pausedPositions.current[track.id] !== undefined) {
        // Resume from saved position
        await TrackPlayer.seekTo(pausedPositions.current[track.id]);
      }

      await TrackPlayer.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsBuffering(false);
      setBufferingTrackId(null);
    }
  }, []);

  // Pause playback
  const pausePlayback = useCallback(async () => {
    try {
      const position = await TrackPlayer.getPosition();
      if (currentTrack) {
        pausedPositions.current[currentTrack.id] = position;
        // Save to AsyncStorage for persistence
        await AsyncStorage.setItem(`podcast_position_${currentTrack.id}`, JSON.stringify({ position, timestamp: Date.now() }));
      }
      await TrackPlayer.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  }, [currentTrack]);

  // Resume playback
  const resumePlayback = useCallback(async () => {
    try {
      if (!currentTrack) {
        return undefined;
      }
      await TrackPlayer.play();
      setIsPlaying(true);
      return true;
    } catch (error) {
      console.error('Error resuming playback:', error);
      return undefined;
    }
  }, [currentTrack]);

  // Stop playback
  const stopPlayback = useCallback(async () => {
    try {
      await TrackPlayer.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }, []);

  // Get last paused podcast
  const getLastPausedPodcast = useCallback(() => {
    if (!currentTrack || currentTrack.type !== 'podcast') {
      // Check if there's a saved position for any podcast
      const savedKeys = Object.keys(pausedPositions.current);
      if (savedKeys.length > 0) {
        const lastSavedKey = savedKeys[savedKeys.length - 1];
        return {
          id: lastSavedKey,
          track: { id: lastSavedKey },
        };
      }
    }
    return null;
  }, [currentTrack]);

  // Clear saved position for podcast
  const clearSavedPodcast = useCallback(async (podcastId) => {
    try {
      delete pausedPositions.current[podcastId];
      await AsyncStorage.removeItem(`podcast_position_${podcastId}`);
    } catch (error) {
      console.error('Error clearing saved podcast:', error);
    }
  }, []);

  // Update current track metadata (for notifications)
// Prevent updateCurrentTrackMetadata from running unnecessarily by memoizing based on stable track ID
  const updateCurrentTrackMetadata = useCallback(async (metadata) => {
    if (!currentTrack) return;

    // Only update if the metadata actually changes something
    const keys = Object.keys(metadata);
    let changed = false;
    for (let key of keys) {
      if (currentTrack[key] !== metadata[key]) {
        changed = true;
        break;
      }
    }

    if (!changed) return; // no actual change, avoid loop

    const updatedTrack = { ...currentTrack, ...metadata };
    setCurrentTrack(updatedTrack);
    try {
      await TrackPlayer.updateMetadataForTrack(0, updatedTrack);
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  // use only track id as dependency to prevent unnecessary re-creation
  }, [currentTrack?.id]);

  const defaultTrack = {
    id: 'fm-stream',
    type: 'fm',
    title: 'SIRAGUGAL CRS FM 89.6 MHz',
    artist: 'SIRAGUGAL CRS FM',
  };

  const value = {
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
    clearSavedPodcast,
    updateCurrentTrackMetadata,
    defaultTrack,
    pausedPositions: pausedPositions.current,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
