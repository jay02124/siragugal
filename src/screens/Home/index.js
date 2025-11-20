import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Linking,
  Easing,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAudio } from '../../context/AudioContext';
import { Bars3Icon } from 'react-native-heroicons/solid';
import ImgAutoSlide from '../../components/ImgAutoSlide';
import color from '../../config/color';
import SideBar from '../../components/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faPlayCircle,
  faPauseCircle,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import PopupAd from '../../components/PopupAd';
import { getBanner } from '../../services/api/Banner/getBanner';
import { getLiveBroadcast } from '../../services/api/LiveBroadcast/getLiveBroadcast';
import { getContact } from '../../services/api/Contact Us/getContact';
import { getPopupAd } from '../../services/api/Popup Ad/getPopupAd';
import { broadwave } from '../../services/api/broadwave';

export default function Home({ navigation }) {
  const {
    currentTrack,
    isPlaying,
    bufferingTrackId,
    playTrack,
    pausePlayback,
    resumePlayback,
    updateCurrentTrackMetadata,
    defaultTrack,
  } = useAudio();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [liveAnim] = useState(new Animated.Value(1));
  const [scrollAnim] = useState(new Animated.Value(0));
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [showPopupAd, setShowPopupAd] = useState(true);
  const [showAd, setShowAd] = useState([]);

  const [banner, setBanner] = useState({});
  const [liveBroadcast, setLiveBroadcast] = useState({});
  const [contactus, setContactus] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);  

  useEffect(() => {
    fetchBanner();
    fetchLiveBroadcast();
    fetchAd();
    fetchContact();
  }, []);

  const animateLiveButton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(liveAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    animateLiveButton();
  }, [liveAnim]);

  const fmTrack = useMemo(
    () => ({
      ...defaultTrack,
      url: broadwave,
      title: liveBroadcast?.broadcast_title || defaultTrack.title,
      artist: 'SIRAGUGAL CRS FM 89.6 MHz',
      artwork: require('../../../assets/logo/logo.png'),
    }),
    [defaultTrack, liveBroadcast?.broadcast_title],
  );

  const isFmActive = currentTrack?.id === fmTrack.id;
  const isFmPlaying = isFmActive && isPlaying;
  const isFmBuffering = bufferingTrackId === fmTrack.id;

  const handleFmToggle = () => {
    if (!isFmActive) {
      playTrack(fmTrack);
      return;
    }
    if (isFmPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  };

  useEffect(() => {
    if (isFmActive) {
      updateCurrentTrackMetadata({
        title: liveBroadcast?.broadcast_title || fmTrack.title,
      });
    }
  }, [isFmActive, liveBroadcast?.broadcast_title, fmTrack.title, updateCurrentTrackMetadata]);

  const fetchBanner = async () => {
    try {
      const response = await getBanner();
      setBanner(response.data);
    } catch (error) {
      console.error('Failed to fetch Banner', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLiveBroadcast = async () => {
    try {
      const response = await getLiveBroadcast();
      console.log(response)
      setLiveBroadcast(response.data[0]);
    } catch (error) {
      console.error('Failed to fetch Live Broadcast', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchContact = async () => {
    try {
      const response = await getContact();
      setContactus(response.data);
    } catch (error) {
      console.error('Failed to fetch contact', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAd = async () => {
    try {
      const response = await getPopupAd();
      setShowAd(response.data);
    } catch (error) {
      console.error('Failed to fetch ad', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (containerWidth > 0 && textWidth > 0) {
      startScrolling();
    }
  }, [containerWidth, textWidth]);

  const startScrolling = () => {
    scrollAnim.setValue(containerWidth);
    const speedFactor = 18;

    const animation = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -textWidth,
        duration: (containerWidth + textWidth) * 1 * speedFactor,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    );

    animation.start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBanner();
  };
    
    return (
        <View className="flex-1" style={{ backgroundColor: color.shadow }}>
            {/* Header Section */}
            <View className="flex-row rounded-b-lg" style={{ backgroundColor: color.primary }}>
                <View className="flex-row flex-1 mt-3 mb-2">
                    <View style={{ flex: 0.8, color: '#fff' }} className="p-3">
                        <View className="flex-1 flex-row justify-start item-center">
                            <Image className="flex-column content-center self-center"
                                source={require("../../../assets/logo/logo.png")}
                                style={{ height: 50, width: 50, objectFit: 'contain' }}
                            />
                            <Text className="flex-column content-center self-center text-sm font-bold text-white ml-2">
                                SIRAGUGAL CRS FM 89.6MHz
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity activeOpacity={0.6} onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="flex-start p-3 ml-3" style={{ flex: 0.2,minWidth: 48, minHeight: 48 }}>
                        <Bars3Icon color={color.white} size={28} />
                    </TouchableOpacity>
                </View>
            </View>

            
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="rounded-t-3xl mb-10" style={{ backgroundColor: color.shadow }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {/* Image Slider Section */}
                <View className="justify-center items-center mt-3">
                    {loading ? (
                        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={color.primary} />
                        </View>
                    ) : (
                        <ImgAutoSlide img_slider={banner} height={300} />
                    )}
                </View>

                {/* FM Player Controls */}
                <View className="justify-center items-center mt-5 mb-5 p-4 m-3" style={{ backgroundColor: color.white, borderRadius: 20 }}>
                    <View className="flex-row justify-between items-center w-full">
                        <Text className="text-lg font-bold" style={{ color: color.primary }}>
                            Now on Live:
                        </Text>

                        {/* Scrolling Track Title */}
                        <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} style={{ overflow: 'hidden', marginHorizontal: 10 }}>
                            <Animated.Text
                                onLayout={(e) => {
                                    const width = e.nativeEvent.layout.width;
                                    setTextWidth(width);
                                    startScrolling();
                                }}
                                style={{
                                    transform: [{ translateX: scrollAnim }],
                                    fontWeight: 'bold',
                                    color: color.primary,
                                    lineHeight: 30,
                                    fontSize: 16,
                                }}
                            >
                                {liveBroadcast.broadcast_title}
                            </Animated.Text>

                        </View>

                    </View>
                    {/* <Animated.Text style={{ transform: [{ scale: liveAnim }] }} className="mt-4 text-red-500 text-base font-bold">
                        LIVE
                    </Animated.Text> */}

                    <View className="flex-row justify-center items-center w-full mt-2">
                        {/* Play / Pause Button */}
                        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFmToggle}
            className="p-3"
            style={{ minWidth: 48, minHeight: 48 }}>
            {isFmBuffering ? (
              <View className="items-center justify-center">
                <ActivityIndicator size="small" color={color.primary} />
                <Text className="text-base text-black font-bold mt-2 text-center">
                  Loading
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center">
                <FontAwesomeIcon
                  icon={isFmPlaying ? faPauseCircle : faPlayCircle}
                  size={30}
                  color={color.primary}
                />
                <Text className="text-base text-black font-bold mt-2 text-center">
                  {isFmPlaying ? 'Pause' : 'Play'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
                    </View>
                </View>

                {/* Social Media Links */}
                <View className="flex-row justify-around items-center mt-5 p-3 mb-10">
                    <TouchableOpacity style={{minWidth: 48,minHeight: 48}} className="items-center" onPress={() => Linking.openURL(contactus[0].links.instagram_link)}>
                        <View style={{ alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faInstagram} size={30} color="#E1306C" />
                            <Text className="text-center" style={{ color: '#E1306C', marginTop: 5 }}>Instagram</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{minWidth: 48,minHeight: 48}} className="items-center" onPress={() => Linking.openURL(contactus[0].links.x_link)}>
                        <View style={{ alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faXTwitter} size={30} color="#000" />
                            <Text className="text-center" style={{ color: '#000', marginTop: 5 }}>X (formerly Twitter)</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{minWidth: 48,minHeight: 48}} className="items-center" onPress={() => Linking.openURL(contactus[0].links.website_link)}>
                        <View style={{ alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faGlobe} size={30} color="#007bff" />
                            <Text className="text-center" style={{ color: '#007bff', marginTop: 5 }}>Website</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Sidebar Component */}
            <SideBar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                navigation={navigation}
            />
      {showAd.length > 0 && (
        <PopupAd
          isVisible={showPopupAd}
          onClose={() => setShowPopupAd(false)}
        />
      )}
        </View>
    );
}
