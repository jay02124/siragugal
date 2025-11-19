import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPause, faMicrophone, faRedo } from '@fortawesome/free-solid-svg-icons';
import color from '../../config/color';
import Header from '../../components/Header';
import { getPodcast } from '../../services/api/Podcast/getPodcast';
import { useAudio } from '../../context/AudioContext';

export default function Podcast({ navigation }) {
  const { currentTrack, isPlaying, isBuffering, bufferingTrackId, playTrack, pausePlayback, resumePlayback, getLastPausedPodcast, clearSavedPodcast } = useAudio();
  const [podcast, setPodcast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedPodcastState, setSavedPodcastState] = useState(null);
  const resumeAttemptRef = useRef(null);

  useEffect(() => {
    fetchPodcast();
  }, []);

  // Update saved podcast state when track changes
  useEffect(() => {
    const lastPaused = getLastPausedPodcast();
    if (lastPaused && lastPaused.id && lastPaused.track) {
      // Only show saved podcast if no podcast is currently playing
      if (currentTrack?.type !== 'podcast') {
        setSavedPodcastState({
          track: lastPaused.track,
          descriptor: lastPaused.track,
        });
      } else {
        setSavedPodcastState(null);
      }
    } else {
      setSavedPodcastState(null);
    }
  }, [currentTrack, isPlaying, getLastPausedPodcast]);

  // Monitor resume attempts and detect failures
  useEffect(() => {
    // If playback started successfully, clear the resume attempt
    if (resumeAttemptRef.current && currentTrack?.id === resumeAttemptRef.current.trackId && isPlaying) {
      resumeAttemptRef.current = null;
      return;
    }

    if (resumeAttemptRef.current) {
      const attempt = resumeAttemptRef.current;
      const timeoutId = setTimeout(() => {
        // Check if we're still attempting this resume
        if (resumeAttemptRef.current && resumeAttemptRef.current.trackId === attempt.trackId) {
          // Check if the track is actually playing
          const isActuallyPlaying = currentTrack?.id === attempt.trackId && isPlaying;
          if (!isActuallyPlaying) {
            // Resume failed - use saved descriptor if available, otherwise find from podcast list
            let descriptorToPlay = null;
            if (savedPodcastState && savedPodcastState.track.id === attempt.trackId) {
              descriptorToPlay = savedPodcastState.descriptor;
            } else {
              const podcastItem = podcast.find((item, idx) => {
                const desc = getTrackDescriptor(item, idx);
                return desc.id === attempt.trackId;
              });
              if (podcastItem) {
                const podcastIndex = podcast.findIndex((item, idx) => {
                  const desc = getTrackDescriptor(item, idx);
                  return desc.id === attempt.trackId;
                });
                descriptorToPlay = getTrackDescriptor(podcastItem, podcastIndex);
              }
            }

            if (descriptorToPlay) {
              // Show alert and play from start
              Alert.alert('This audio can not be resumed', 'Playing from start');
              clearSavedPodcast(attempt.trackId);
              playTrack(descriptorToPlay, { position: 0 });

              if (savedPodcastState && savedPodcastState.track.id === attempt.trackId) {
                setSavedPodcastState(null);
              }
            }
            resumeAttemptRef.current = null;
          } else {
            // Resume succeeded - clear the attempt
            resumeAttemptRef.current = null;
          }
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentTrack, isPlaying, savedPodcastState, podcast, clearSavedPodcast, playTrack]);

  const fetchPodcast = async () => {
    try {
      const response = await getPodcast();
      console.log('response', response.data);
      setPodcast(response.data);
    } catch (error) {
      console.error('Failed to fetch podcasts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTrackDescriptor = (item, index) => ({
    id: item.id?.toString() || item._id || `podcast-${index}`,
    type: 'podcast',
    title: item.broadcast_title || item.title || 'Siragugal CRS Podcast',
    artist: item.broadcast_decp || item.artist || 'Siragugal CRS Podcast',
    url: item.broadcast_link || item.url || '',
    duration: item.broadcast_duration || item.duration || '00:00',
    artwork: require('../../../assets/logo/logo.png'),
  });

  const handleToggle = (item, index) => {
    const descriptor = getTrackDescriptor(item, index);
    const isActive = currentTrack?.id === descriptor.id;

    if (isActive) {
      if (isPlaying) {
        pausePlayback();
      } else {
        const resumeResult = resumePlayback();
        if (resumeResult === undefined) {
          playTrack(getTrackDescriptor(podcast[0], 0));
        }
      }
      return;
    }
    playTrack(descriptor);
  };

  const activePodcastTitle = useMemo(() => {
    if (currentTrack?.type !== 'podcast') {
      return null;
    }
    return currentTrack.title;
  }, [currentTrack]);

  const handleResume = async () => {
    if (savedPodcastState) {
      // Mark that we're attempting a resume
      resumeAttemptRef.current = {
        trackId: savedPodcastState.track.id,
        timestamp: Date.now(),
      };

      // Attempt to play/resume
      await playTrack(savedPodcastState.descriptor);

      // The useEffect will monitor and handle failure detection
    }
  };

  const handleStartOver = () => {
    if (savedPodcastState) {
      // Clear the saved position for this podcast
      clearSavedPodcast(savedPodcastState.track.id);
      // Play from the beginning (position 0)
      playTrack(savedPodcastState.descriptor, { position: 0 });
      // Update state immediately to reflect the change
      setTimeout(() => {
        const lastPaused = getLastPausedPodcast();
        if (!lastPaused || lastPaused.id !== savedPodcastState.track.id) {
          setSavedPodcastState(null);
        }
      }, 100);
    }
  };

  const handleBottomControl = () => {
    if (currentTrack?.type === 'podcast') {
      if (isPlaying) {
        pausePlayback();
      } else {
        const resumeResult = resumePlayback();
        console.log('resumeResult', resumeResult);
        if (resumeResult === undefined) {
          playTrack(getTrackDescriptor(podcast[0], 0));
        }
      }
      return;
    }

    // If there's a saved podcast, resume it
    if (savedPodcastState) {
      handleResume();
      return;
    }

    // Otherwise, play the first podcast
    if (podcast.length > 0) {
      playTrack(getTrackDescriptor(podcast[0], 0));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color.shadow }]}>
      <Header screen_name="Podcast" navigation={navigation} icon={faMicrophone} />
      {loading ? (
        <ActivityIndicator size="large" color={color.primary} />
      ) : (
        <FlatList
          data={podcast}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPodcast} />}
          renderItem={({ item, index }) => {
            const descriptor = getTrackDescriptor(item, index);
            const isActive = currentTrack?.id === descriptor.id;
            const isLoading = bufferingTrackId === descriptor.id && isBuffering;
            const showPause = isActive && isPlaying && !isLoading;
            const lastPaused = getLastPausedPodcast();
            const hasBeenPlayed = lastPaused && lastPaused.id === descriptor.id && !isActive;

            const handleItemResume = async () => {
              // Mark that we're attempting a resume
              resumeAttemptRef.current = {
                trackId: descriptor.id,
                timestamp: Date.now(),
              };

              // Attempt to play/resume
              await playTrack(descriptor);

              // The useEffect will monitor and handle failure detection
            };

            const handleItemStartOver = () => {
              clearSavedPodcast(descriptor.id);
              playTrack(descriptor, { position: 0 });
            };

            return (
              <>
                <View className="p-4 border-b" style={{ borderColor: color.primary, borderBottomWidth: 2 }}>
                  <Text className="text-base mb-2 font-bold" style={{ color: color.black }}>
                    {item.broadcast_title}
                  </Text>
                  <Text className="text-sm mt-2 mb-2" style={{ color: color.black }}>
                    {item.broadcast_decp}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-800">{item.broadcast_duration}</Text>
                    <View className="items-center justify-center flex-row">
                      {isLoading ? (
                        <>
                          <Text className="text-base font-bold mr-2 text-center" style={{ color: color.primary }}>
                            Loading
                          </Text>
                          <ActivityIndicator size="small" color={color.primary} />
                        </>
                      ) : isActive ? (
                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleToggle(item, index)} className="flex-row items-center">
                          <Text className="text-base font-bold mr-2 text-center" style={{ color: color.primary }}>
                            {showPause ? 'Pause' : 'Play'}
                          </Text>
                          <FontAwesomeIcon icon={showPause ? faPause : faPlay} size={20} color={color.primary} />
                        </TouchableOpacity>
                      ) : hasBeenPlayed ? (
                        <View className="flex-row items-center">
                          <TouchableOpacity activeOpacity={0.6} onPress={handleItemResume} className="flex-row items-center mr-3" style={{ minWidth: 48, minHeight: 48 }}>
                            <Text className="text-base font-bold mr-1 text-center" style={{ color: color.primary }}>
                              Resume
                            </Text>
                            <FontAwesomeIcon icon={faPlay} size={18} color={color.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity activeOpacity={0.6} onPress={handleItemStartOver} style={{ minWidth: 48, minHeight: 48 }} className="flex-row items-center justify-center">
                            <FontAwesomeIcon icon={faRedo} size={18} color={color.primary} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleToggle(item, index)} className="flex-row items-center">
                          <Text className="text-base font-bold mr-2 text-center" style={{ color: color.primary }}>
                            Play
                          </Text>
                          <FontAwesomeIcon icon={faPlay} size={20} color={color.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </>
            );
          }}
        />
      )}
      {/* Always visible controls */}
      <View className="rounded-lg bottom-20 py-2 m-3 justify-center items-center px-3" style={{ backgroundColor: color.primary }}>
        <View className="flex-row items-center justify-between w-full px-2 py-2">
          {activePodcastTitle ? (
            <View style={{ maxWidth: '60%' }}>
              <Text className="text-white text-sm font-bold text-left">
                {activePodcastTitle}
              </Text>
            </View>
          ) : savedPodcastState?.track?.title ? (
            <View style={{ maxWidth: '60%' }}>
              <Text className="text-white text-sm font-bold text-left">
                {savedPodcastState.track.title}
              </Text>
            </View>
          ) : (
            <Text className="text-white text-sm font-bold text-center" style={{ flex: 1 }}>
              Podcast
            </Text>
          )}
          <View className="flex-row items-center justify-end" style={{ flex: 1 }}>
            {currentTrack?.type === 'podcast' ? (
              <TouchableOpacity activeOpacity={0.6} style={{ minWidth: 48, minHeight: 48 }} onPress={handleBottomControl} className="flex-row justify-center items-center">
                {bufferingTrackId === currentTrack?.id && isBuffering ? (
                  <>
                    <Text className="text-base font-bold mr-2 text-center" style={{ color: color.white }}>
                      Loading
                    </Text>
                    <ActivityIndicator size="small" color="#fff" />
                  </>
                ) : (
                  <>
                    <Text className="text-base font-bold mr-2 text-center" style={{ color: color.white }}>
                      {isPlaying ? 'Pause' : 'Play'}
                    </Text>
                    <FontAwesomeIcon
                      icon={isPlaying ? faPause : faPlay}
                      size={25}
                      color="#fff"
                    />
                  </>
                )}
              </TouchableOpacity>
            ) : savedPodcastState ? (
              <>
                <TouchableOpacity activeOpacity={0.6} style={{ minWidth: 48, minHeight: 48, marginRight: 10 }} onPress={handleResume} className="flex-row justify-center items-center">
                  <Text className="text-base font-bold mr-2 text-center" style={{ color: color.white }}>
                    Resume
                  </Text>
                  <FontAwesomeIcon icon={faPlay} size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.6} style={{ minWidth: 48, minHeight: 48 }} onPress={handleStartOver} className="flex-row justify-center items-center">
                  <FontAwesomeIcon icon={faRedo} size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity activeOpacity={0.6} style={{ minWidth: 48, minHeight: 48 }} onPress={handleBottomControl} className="flex-row justify-center items-center">
                <Text className="text-base font-bold mr-2 text-center" style={{ color: color.white }}>
                  Play
                </Text>
                <FontAwesomeIcon icon={faPlay} size={25} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    margin: 20
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  duration: {
    fontSize: 12,
    color: '#999',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: color.primary,
    padding: 10,
    borderRadius: 5,
  },
  playText: {
    color: '#fff',
    marginLeft: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: color.primary,
    padding: 10,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    textAlign: 'center', // Center the title in the controls
  },
});
