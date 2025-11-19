import { View, Text, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import color from '../../config/color';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlayCircle, faVideo } from '@fortawesome/free-solid-svg-icons';
import { getYoutube } from '../../services/api/Youtube/getYoutube';

export default function Youtube({ navigation }) {
  const [activeTab, setActiveTab] = useState('Live');
  const [youTubeData, setYoutubeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchYoutube();
  }, []);

  const fetchYoutube = async () => {
    setLoading(true);
    try {
      const response = await getYoutube();
      setYoutubeData(response.data);
    } catch (error) {
      console.error('Failed to fetch Youtube', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchYoutube();
  };

  const handleVideoPress = (videoUrl) => {
    Linking.openURL(videoUrl).catch(err => console.error('An error occurred', err));
  };

  const handleLiveVideoPress = (videoUrl) => {
    navigation.navigate('YoutubePlayer', { videoUrl });
  };

  const getYoutubeThumbnail = (videoUrl) => {
    let videoId = '';
    if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtube.com/live/')) {
      videoId = videoUrl.split('live/')[1].split('?')[0];
    }
    return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: color.shadow }}>
      <Header screen_name="YouTube" navigation={navigation} icon={faVideo} />

      {/* Tabs for Live and Recorded */}
      <View className="flex-row justify-around mt-3">
        <TouchableOpacity style={{minWidth: 48,minHeight: 48}} onPress={() => setActiveTab('Live')} className={`p-3 ${activeTab === 'Live' ? 'border-b-2 border-green-600' : ''}`}>
          <Text className="font-bold text-base" style={{ color: activeTab === 'Live' ? color.danger : color.danger }}>Live Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{minWidth: 48,minHeight: 48}} onPress={() => setActiveTab('Recorded')} className={`p-3 ${activeTab === 'Recorded' ? 'border-b-2 border-green-600' : ''}`}>
          <Text className="font-bold text-base" style={{ color: activeTab === 'Recorded' ? color.danger : color.danger }}>Recorded Video</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 rounded-t-3xl mt-3" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {/* Filter and display videos based on activeTab */}
          {youTubeData.length > 0 ? (
            youTubeData
              .filter(item => item.category_name === activeTab)
              .map(item => (
                <TouchableOpacity
                  activeOpacity={0.6}
                  key={item.main_id}
                  className="flex-row rounded-lg items-center m-3 p-3 border-l"
                  style={{ backgroundColor: color.white, borderLeftColor: color.primary, borderLeftWidth: 3,minWidth: 48, minHeight: 48 }}
                  onPress={item.category_name === "Recorded" ? () => handleVideoPress(item.youtube_link) : () => handleVideoPress(item.youtube_link)}
                >
                  <View className="mr-4" style={{ position: 'relative' }}>
                    <Image source={{ uri: getYoutubeThumbnail(item.youtube_link) }} style={{ width: 100, height: 80, borderRadius: 10 }} />
                    <FontAwesomeIcon icon={faPlayCircle} size={24} color={color.white} style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -12 }, { translateY: -12 }] }} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: color.primary }} className="font-bold text-sm">{item.youtube_title}</Text>
                    <Text style={{ color: color.black }} className="text-sm mt-2">{item.youtube_decp}</Text>
                  </View>
                </TouchableOpacity>
              ))
          ) : (
            <Text style={{ color: color.black, textAlign: 'center', marginTop: 20 }}>No content available</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
