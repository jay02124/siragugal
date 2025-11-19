import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator, RefreshControl, FlatList} from 'react-native'
import React, { useEffect, useState } from 'react'
import color from '../../config/color'
import Header from '../../components/Header'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faMusic } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { getSongRequest } from '../../services/api/Song Request/getSongRequest'

export default function SongRequest({navigation}) {
  const [songRequest, setSongRequest] = useState({})
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSongRequest()
  }, [])

  const fetchSongRequest = async () => {
    setLoading(true)
    try{
      const response = await getSongRequest();
      setSongRequest(response.data)
    }
    catch (error) {
      console.error("Failed to fetch Song Request", error);
    }  
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true); 
    fetchSongRequest();
  };

  const handleWhatsAppPress = () => {
    const numberSongReq = songRequest[0]?.song_request_whatsapp_no || '9092928811';
    const whatsappUrl = `https://wa.me/${numberSongReq}`;
    Linking.openURL(whatsappUrl).catch(err => {
      console.error('Error opening WhatsApp', err);
      Alert.alert('Error', 'Failed to open WhatsApp.');
    });
  };

  const renderSongRequest = () => (
    <View className="items-center">
      <Text className="text-center text-lg font-bold" style={{ color: color.primary }}>
        Request Your Favorite Songs!{'\n'}Stay Tuned with SIRAGUGAL CRS FM {'\n'} @7pm to 8pm
      </Text>

      {/* WhatsApp Button */}
      <TouchableOpacity activeOpacity={0.6} onPress={handleWhatsAppPress} className="flex-row justify-center items-center mt-10 rounded-2xl p-4" style={{ backgroundColor: color.white,minWidth: 48, minHeight: 48 }}>
        <FontAwesomeIcon icon={faWhatsapp} color={color.primary} size={24} />
        <Text className="ml-2 text-base font-semibold" style={{ color: color.primary }}>
          Request your songs via WhatsApp
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: color.shadow }}>
      <Header screen_name="Song Request" navigation={navigation} icon={faMusic} />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderSongRequest}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        />
      )}
    </View>
  )
}
