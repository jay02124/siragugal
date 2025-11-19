import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Alert } from 'react-native';
import Sound from 'react-native-sound';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPause, faStepForward, faStepBackward, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import color from '../../config/color';
import Header from '../../components/Header';
import { getPodcast } from '../../services/api/Podcast/getPodcast';

Sound.setCategory('Playback');

export default function Podcast({ navigation }) {
  const [podcast, setPodcast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState("");

  useEffect(() => {
    fetchPodcast();
  }, []);

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.stop(() => currentSound.release());
      }
    };
  }, [currentSound]);
  

  const fetchPodcast = async () => {
    try {
      const response = await getPodcast();
      setPodcast(response.data);
    } catch (error) {
      console.error("Failed to fetch podcasts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const togglePlay = async (index) => {
    if (currentSound) {
      if (currentTrackIndex === index) {
        if (isPlaying) {
          currentSound.pause()
          setIsPlaying(false);
        } else {
          currentSound.play();
          setIsPlaying(true);
        }
        return;
      }

      currentSound.stop(() => {
        currentSound.release();
      });
      setCurrentSound(null);
      setIsPlaying(false);
    }

    const track = podcast[index];
    const sound = new Sound(track.broadcast_link, null, (error) => {
      if (error) {
        // console.error("Error loading sound:", error);
        Alert.alert("Unable to play audio due to an error in server. Redirecting to the home page.");
        return;
      }
  
      setCurrentSound(sound);
      setCurrentTrackIndex(index);
      setCurrentTrackTitle(track.broadcast_title);
  
      sound.play((success) => {
        if (success) {
          setIsPlaying(true);
        } else {
          // console.error("Playback failed due to audio decoding errors.");
          Alert.alert("Playback failed. Redirecting to the home page.");
          sound.stop(() => sound.release());
          setCurrentSound(null);
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    });
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
          renderItem={({ item, index }) => (
            <>
              <TouchableOpacity activeOpacity={0.6} className="p-4 border-b" style={{ borderColor: color.primary, borderBottomWidth: 2, minWidth: 48, minHeight: 48 }} onPress={() => togglePlay(index)} >
                <Text className="text-base mb-2 font-bold" style={{ color: color.black }}>
                  {item.broadcast_title}
                </Text>
                <Text className="text-sm mt-2 mb-2" style={{ color: color.black }}>
                  {item.broadcast_decp}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-800">{item.broadcast_duration}</Text>
                  <View className="items-center justify-center flex-row">
                    <Text className="text-base font-bold mr-2 text-center" style={{color: color.primary}}>
                      {currentTrackIndex === index && isPlaying ? "Pause" : "Play"}
                    </Text>
                    <FontAwesomeIcon icon={currentTrackIndex === index && isPlaying ? faPause : faPlay} className="text-brown-500"/>
                  </View>
                </View>
              </TouchableOpacity>
            </>
          )}
        />
      )}
      {/* Always visible controls */}
      <View className="rounded-lg bottom-20 py-2 m-3 justify-center items-center px-3" style={{ backgroundColor: color.primary }}>
        <View className="flex-row items-center justify-between w-full px-2 py-2">
          {currentTrackIndex !== null ? (
            <Text className="text-white text-sm font-bold text-left">
              {currentTrackTitle}
            </Text>
          ) : (
            <Text className="text-white text-sm font-bold text-center">
              Podcast
            </Text>
          )}
          <TouchableOpacity activeOpacity={0.6} style={{minWidth: 48,minHeight: 48}} onPress={() => togglePlay(currentTrackIndex)} className="flex-row justify-center items-center">
            <Text className="text-base font-bold mr-2 text-center" style={{color: color.white}}>
              {isPlaying ? "Pause" : "Play"}
            </Text>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size={25} color="#fff"/>
          </TouchableOpacity>
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
