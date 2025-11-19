import { View, Text , ScrollView, RefreshControl, ActivityIndicator} from 'react-native'
import React, { useEffect, useState } from 'react'
import color from '../../config/color';
import Header from '../../components/Header';
import { getPrivacyPolicy } from '../../services/api/Privacy Policy/getPrivacyPolicy';

export default function PrivacyPolicy({navigation}) {
  const [privacy, setPrivacy] = useState({})
  // console.log("Privacy fetch", privacy)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPrivacyPolicy()
  }, [])

  const fetchPrivacyPolicy = async () => {
    setLoading(true)
    try{
      const response = await getPrivacyPolicy();
      setPrivacy(response.data)
    }
    catch (error) {
      console.error("Failed to fetch Privacy Policy", error);
    }  
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true); 
    fetchPrivacyPolicy();
  };
  return (
    <View className="flex-1" style={{ backgroundColor: color.shadow }}>
      <Header screen_name="Privacy Policy" navigation={navigation}/>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 rounded-t-3xl mt-3" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {privacy.length > 0 ? (
            privacy.map((item, index) => (
              <View key={index} className="px-3 py-2">
                <Text className="font-bold text-xl text-center mb-3" style={{color: color.primary}}>{item.security_title}</Text>
                <Text className="font-semibold text-sm text-justify mt-2" style={{color: color.black}}>{item.security_descp}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: color.black }}>No content available</Text>
          )}
        </ScrollView> 
      )}
    </View>
  )
}