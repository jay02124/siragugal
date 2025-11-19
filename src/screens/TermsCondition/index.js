import { View, Text , ScrollView, RefreshControl, ActivityIndicator} from 'react-native'
import React, { useEffect, useState } from 'react'
import color from '../../config/color';
import Header from '../../components/Header';
import { getTermsCondition } from '../../services/api/Terms and Condition/getTermsCondition';

export default function TermsCondition({navigation}) {
  const [terms, setTerms] = useState({})
  // console.log("Terms condition fetch", terms)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTermsCondi()
  }, [])

  const fetchTermsCondi = async () => {
    setLoading(true)
    try{
      const response = await getTermsCondition();
      setTerms(response.data)
    }
    catch (error) {
      console.error("Failed to fetch Announcement", error);
    }  
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true); 
    fetchTermsCondi();
  };
  return (
    <View className="flex-1" style={{ backgroundColor: color.shadow }}>
      <Header screen_name="Announcement" navigation={navigation}/>
      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 rounded-t-3xl mt-3" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {terms.length > 0 ? (
            terms.map((item) => (
                <View key={item.prod_st_dt_id} className="px-3 py-2">
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