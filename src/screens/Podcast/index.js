import React, {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPlay,
  faPause,
  faMicrophone,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import color from '../../config/color';
import Header from '../../components/Header';
import {getPodcast} from '../../services/api/Podcast/getPodcast';
import {useAudio} from '../../context/AudioContext';

export default function Podcast({navigation}) {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    bufferingTrackId,
    playTrack,
    pausePlayback,
    resumePlayback,
    getLastPausedPodcast,
    saveLastPodcast,
    clearSavedPodcast,
    trackList,
    setTrackList,
    getDefaultFMTrack,
    updateCurrentTrackMetadata,
  } = useAudio();

  const [podcast, setPodcast] = useState(trackList || []);
  const [loading, setLoading] = useState(podcast.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPlayedPodcast, setLastPlayedPodcast] = useState(null);
  const [showHint, setShowHint] = useState(true);
  const resumeAttemptRef = useRef(null);

  const hintAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (currentTrack?.type === 'fm') {
      //console.log(currentTrack)
      const fm = getDefaultFMTrack(currentTrack.url, currentTrack.title);
      updateCurrentTrackMetadata({
        title: fm.title,
        artist: fm.artist,
      });
    }
  }, []);

  // Animated "pull to refresh" hint
  useEffect(() => {
    setShowHint(true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(hintAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(hintAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      setShowHint(false);
    }, 4000); // hide after 4 seconds

    return () => clearTimeout(timer);
  }, [hintAnim]);

  // Load last played podcast from AsyncStorage
  const loadLastPlayedPodcast = useCallback(async () => {
    try {
      const lastPodcast = await getLastPausedPodcast();
      if (lastPodcast) {
        setLastPlayedPodcast(lastPodcast);
      }
    } catch (error) {
      console.error('Error loading last podcast:', error);
    }
  }, [getLastPausedPodcast]);

  const fetchPodcast = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh && podcast.length > 0) {
          // Already have data and not a refresh → skip
          setLoading(false);
          setRefreshing(false);
          return;
        }

        const response = await getPodcast();
        const data = response.data || [];
        setPodcast(data);
        setTrackList(data); // cache globally
      } catch (error) {
        console.error('Failed to fetch podcasts:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [podcast.length, setTrackList],
  );

  useEffect(() => {
    const initializeScreen = async () => {
      if (!trackList || trackList.length === 0) {
        await fetchPodcast();
      } else {
        setPodcast(trackList);
        setLoading(false);
      }
      await loadLastPlayedPodcast();
    };

    initializeScreen();
  }, [trackList, fetchPodcast, loadLastPlayedPodcast]);

  // Save current podcast as last played when track changes
  useEffect(() => {
    if (currentTrack?.type === 'podcast') {
      const data = {
        id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        url: currentTrack.url,
        artwork: currentTrack.artwork,
      };
      saveLastPodcast(data);
      setLastPlayedPodcast(data);
    }
  }, [currentTrack, saveLastPodcast]);

  // Monitor resume attempts and detect failures
  useEffect(() => {
    if (
      resumeAttemptRef.current &&
      currentTrack?.id === resumeAttemptRef.current.trackId &&
      isPlaying
    ) {
      resumeAttemptRef.current = null;
      return;
    }

    if (resumeAttemptRef.current) {
      const attempt = resumeAttemptRef.current;
      const timeoutId = setTimeout(() => {
        if (
          resumeAttemptRef.current &&
          resumeAttemptRef.current.trackId === attempt.trackId
        ) {
          const isActuallyPlaying =
            currentTrack?.id === attempt.trackId && isPlaying;
          if (!isActuallyPlaying) {
            Alert.alert('This audio can not be resumed', 'Playing from start');
            clearSavedPodcast(attempt.trackId);

            const podcastItem = podcast.find(
              item =>
                (item.id?.toString() || item._id?.toString()) ===
                attempt.trackId,
            );

            if (podcastItem) {
              const podcastIndex = podcast.findIndex(
                item =>
                  (item.id?.toString() || item._id?.toString()) ===
                  attempt.trackId,
              );
              playTrack(getTrackDescriptor(podcastItem, podcastIndex), {
                position: 0,
              });
            }
            resumeAttemptRef.current = null;
          } else {
            resumeAttemptRef.current = null;
          }
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentTrack, isPlaying, podcast, clearSavedPodcast, playTrack]);

  // Build normalized descriptor supporting both A + B shapes
  const getTrackDescriptor = (item, index) => {
    const id =
      item.id?.toString() || item._id?.toString() || `podcast-${index}`;

    return {
      id,
      type: 'podcast',
      title: item.broadcast_title || item.title || 'Siragugal CRS Podcast',
      artist: item.broadcast_decp || item.artist || 'Siragugal CRS Podcast',
      url: item.broadcast_link || item.url || '',
      duration: item.broadcast_duration || item.duration || '00:00',
      artwork: require('../../../assets/logo/logo.png'),
    };
  };

  const handleToggle = (item, index) => {
    const descriptor = getTrackDescriptor(item, index);
    const isActive = currentTrack?.id === descriptor.id;

    if (isActive) {
      if (isPlaying) {
        pausePlayback();
      } else {
        resumePlayback();
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
  // Update notification metadata when podcast changes
  useEffect(() => {
    if (currentTrack?.type === 'podcast') {
      console.log(currentTrack)
      updateCurrentTrackMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || 'Siragugal CRS Podcast',
      });
    }
  }, [currentTrack?.id]);

  const buildDescriptorFromLastPlayed = () => {
    if (!lastPlayedPodcast || !lastPlayedPodcast.id || !lastPlayedPodcast.url) {
      return null;
    }

    return {
      id: lastPlayedPodcast.id.toString(),
      type: 'podcast',
      title: lastPlayedPodcast.title || 'Siragugal CRS Podcast',
      artist: lastPlayedPodcast.artist || 'Siragugal CRS Podcast',
      url: lastPlayedPodcast.url,
      artwork:
        lastPlayedPodcast.artwork || require('../../../assets/logo/logo.png'),
    };
  };

  const handleResume = async () => {
    if (!lastPlayedPodcast) return;

    let podcastItem = podcast.find(
      item =>
        (item.id?.toString() || item._id?.toString()) ===
        lastPlayedPodcast.id?.toString(),
    );

    let descriptorToPlay = null;

    if (podcastItem) {
      const podcastIndex = podcast.indexOf(podcastItem);
      descriptorToPlay = getTrackDescriptor(podcastItem, podcastIndex);
    } else {
      // fallback: use stored lastPlayedPodcast info directly
      descriptorToPlay = buildDescriptorFromLastPlayed();
    }

    if (!descriptorToPlay || !descriptorToPlay.url) {
      Alert.alert('Error', 'Could not find podcast information');
      return;
    }

    resumeAttemptRef.current = {
      trackId: descriptorToPlay.id,
      timestamp: Date.now(),
    };

    await playTrack(descriptorToPlay);
  };

  const handleStartOver = () => {
    if (!lastPlayedPodcast) return;

    let podcastItem = podcast.find(
      item =>
        (item.id?.toString() || item._id?.toString()) ===
        lastPlayedPodcast.id?.toString(),
    );

    let descriptorToPlay = null;

    if (podcastItem) {
      const podcastIndex = podcast.indexOf(podcastItem);
      descriptorToPlay = getTrackDescriptor(podcastItem, podcastIndex);
    } else {
      descriptorToPlay = buildDescriptorFromLastPlayed();
    }

    if (!descriptorToPlay || !descriptorToPlay.url) {
      Alert.alert('Error', 'Could not find podcast information');
      return;
    }

    clearSavedPodcast(descriptorToPlay.id);
    playTrack(descriptorToPlay, {position: 0});
  };

  const handleBottomControl = () => {
    if (currentTrack?.type === 'podcast') {
      if (isPlaying) {
        pausePlayback();
      } else {
        resumePlayback();
      }
      return;
    }

    if (lastPlayedPodcast) {
      handleResume();
      return;
    }

    if (podcast.length > 0) {
      playTrack(getTrackDescriptor(podcast[0], 0));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPodcast(true);
  };

  return (
    <View style={[styles.container, {backgroundColor: color.shadow}]}>
      {/* Popup Hint - absolute at top, non-blocking */}
      {showHint && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 54,
            left: 0,
            right: 0,
            zIndex: 100,
            alignItems: 'center',
            opacity: hintAnim,
          }}>
          <View
            style={{
              backgroundColor: color.primary + 'EE', // semi-transparent
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 16,
              marginHorizontal: 32,
              minWidth: 200,
              maxWidth: '80%',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 4,
            }}>
            <Text
              style={{
                color: color.white,
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              Pull down to refresh podcasts
            </Text>
          </View>
        </Animated.View>
      )}

      <Header
        screen_name="Podcast"
        navigation={navigation}
        icon={faMicrophone}
      />

      {loading ? (
        <ActivityIndicator size="large" color={color.primary} />
      ) : podcast.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: color.black, fontSize: 16}}>
            No podcasts available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={podcast}
          keyExtractor={(_, index) => index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({item, index}) => {
            const descriptor = getTrackDescriptor(item, index);
            const isActive = currentTrack?.id === descriptor.id;
            const isLoading = bufferingTrackId === descriptor.id && isBuffering;
            const showPause = isActive && isPlaying && !isLoading;

            const hasBeenPlayed =
              lastPlayedPodcast &&
              lastPlayedPodcast.id?.toString() === descriptor.id &&
              !isActive;

            const handleItemResume = async () => {
              resumeAttemptRef.current = {
                trackId: descriptor.id,
                timestamp: Date.now(),
              };
              await playTrack(descriptor);
            };

            const handleItemStartOver = () => {
              clearSavedPodcast(descriptor.id);
              playTrack(descriptor, {position: 0});
            };

            return (
              <View
                className="p-4 border-b"
                style={{
                  borderColor: color.primary,
                  borderBottomWidth: 2,
                }}>
                <Text
                  className="text-base mb-2 font-bold"
                  style={{color: color.black}}>
                  {item.broadcast_title || item.title}
                </Text>

                <Text
                  className="text-sm mt-2 mb-2"
                  style={{color: color.black}}>
                  {item.broadcast_decp || item.artist}
                </Text>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-800">
                    {item.broadcast_duration || item.duration}
                  </Text>

                  <View className="items-center justify-center flex-row">
                    {isLoading ? (
                      <>
                        <Text
                          className="text-base font-bold mr-2 text-center"
                          style={{color: color.primary}}>
                          Loading
                        </Text>
                        <ActivityIndicator size="small" color={color.primary} />
                      </>
                    ) : isActive ? (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => handleToggle(item, index)}
                        className="flex-row items-center">
                        <Text
                          className="text-base font-bold mr-2 text-center"
                          style={{color: color.primary}}>
                          {showPause ? 'Pause' : 'Play'}
                        </Text>
                        <FontAwesomeIcon
                          icon={showPause ? faPause : faPlay}
                          size={20}
                          color={color.primary}
                        />
                      </TouchableOpacity>
                    ) : hasBeenPlayed ? (
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          activeOpacity={0.6}
                          onPress={handleItemResume}
                          className="flex-row items-center mr-3"
                          style={{minWidth: 48, minHeight: 48}}>
                          <Text
                            className="text-base font-bold mr-1 text-center"
                            style={{color: color.primary}}>
                            Resume
                          </Text>
                          <FontAwesomeIcon
                            icon={faPlay}
                            size={18}
                            color={color.primary}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.6}
                          onPress={handleItemStartOver}
                          style={{minWidth: 48, minHeight: 48}}
                          className="flex-row items-center justify-center">
                          <FontAwesomeIcon
                            icon={faRedo}
                            size={18}
                            color={color.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => handleToggle(item, index)}
                        className="flex-row items-center">
                        <Text
                          className="text-base font-bold mr-2 text-center"
                          style={{color: color.primary}}>
                          Play
                        </Text>
                        <FontAwesomeIcon
                          icon={faPlay}
                          size={20}
                          color={color.primary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Bottom controls */}
      <View
        className="rounded-lg bottom-20 py-2 m-3 justify-center items-center px-3"
        style={{backgroundColor: color.primary}}>
        <View className="flex-row items-center justify-between w-full px-2 py-2">
          {activePodcastTitle ? (
            <View style={{maxWidth: '60%'}}>
              <Text className="text-white text-sm font-bold text-left">
                {activePodcastTitle}
              </Text>
            </View>
          ) : lastPlayedPodcast?.title ? (
            <View style={{maxWidth: '60%'}}>
              <Text className="text-white text-sm font-bold text-left">
                {lastPlayedPodcast.title}
              </Text>
            </View>
          ) : (
            <Text
              className="text-white text-sm font-bold text-center"
              style={{flex: 1}}>
              Podcast
            </Text>
          )}

          <View className="flex-row items-center justify-end" style={{flex: 1}}>
            {currentTrack?.type === 'podcast' ? (
              <TouchableOpacity
                activeOpacity={0.6}
                style={{minWidth: 48, minHeight: 48}}
                onPress={handleBottomControl}
                className="flex-row justify-center items-center">
                {bufferingTrackId === currentTrack?.id && isBuffering ? (
                  <>
                    <Text
                      className="text-base font-bold mr-2 text-center"
                      style={{color: color.white}}>
                      Loading
                    </Text>
                    <ActivityIndicator size="small" color="#fff" />
                  </>
                ) : (
                  <>
                    <Text
                      className="text-base font-bold mr-2 text-center"
                      style={{color: color.white}}>
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
            ) : lastPlayedPodcast ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={{
                    minWidth: 48,
                    minHeight: 48,
                    marginRight: 10,
                  }}
                  onPress={handleResume}
                  className="flex-row justify-center items-center">
                  <Text
                    className="text-base font-bold mr-2 text-center"
                    style={{color: color.white}}>
                    Resume
                  </Text>
                  <FontAwesomeIcon icon={faPlay} size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={{minWidth: 48, minHeight: 48}}
                  onPress={handleStartOver}
                  className="flex-row justify-center items-center">
                  <FontAwesomeIcon icon={faRedo} size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                style={{minWidth: 48, minHeight: 48}}
                onPress={handleBottomControl}
                className="flex-row justify-center items-center">
                <Text
                  className="text-base font-bold mr-2 text-center"
                  style={{color: color.white}}>
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
});
