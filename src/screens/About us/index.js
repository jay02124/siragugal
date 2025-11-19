import { View, Text, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import color from '../../config/color'
import { getAbout } from '../../services/api/About Us/getAbout'

export default function About({navigation}) {
  const about = [
    {
      id: 11,
      image: require("../../../assets/slider/1.jpg"),
      title: "About Siragugal FM",
      desc: "For the people of Karur area, programs planned, produced and presented by the people themselves are going to be aired on the Chiragul community service 89.6 radio. Through this, local artists, agriculturists, artisans, talents, multi-disciplinary achievers, laborers, students participate and the younger generation of Karur also organizes performances."
    },
    {
      id: 21,
      // image: require("../../../assets/slider/1.jpg"),
      desc: "As ancient as such an old one; Another highlight in the historical pages of Karur which stands as a proof of innovation is the emergence of a radio station called 'Siragugal CRS FM 89.6'. 'Wings Trust' community development led by Mr. S. Chidambaram who has been doing many sacred works with community spirit in Karur and surrounding areas for many years"
    },
  ]
  const [aboutus, setAboutus] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // console.log("About us fetch", aboutus)

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    setLoading(true)
    try{
      const response = await getAbout();
      setAboutus(response.data)
    }
    catch (error) {
      console.error("Failed to fetch About us", error);
    }  
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchAbout();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: color.shadow }}>
        <Header screen_name="About Us" navigation={navigation}/>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={color.primary} />
          </View>
        ) : (
          <ScrollView style={{ backgroundColor: color.shadow }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View className="p-4">
              {aboutus.length > 0 ? (
                aboutus.map((section, index) => (
                  <View key={index}>
                    <Text className="text-base text-center mb-3 font-bold" style={{ color: color.black }}>
                      {section.about_title}
                    </Text>
                    {section.about_image && (
                      section.about_image.map((image, idx) =>{ 
                        return(
                          <Image
                            source={{uri: image[`image${idx+1}`]}}
                            className="w-full h-60 rounded-lg mt-5"
                            style={{ resizeMode: 'cover', marginBottom: 20 }}
                          />  
                        )
                      })
                    )}
                    <Text className="text-sm text-justify" style={{ color: color.black }}>
                      {section.about_descp}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: color.black }}>No content available</Text>
              )}
            </View>
          </ScrollView>
        )}
    </View>
  )
}