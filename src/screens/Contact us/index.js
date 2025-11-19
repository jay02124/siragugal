import { View, Text, ScrollView , Image, TouchableOpacity, Linking, ActivityIndicator, RefreshControl} from 'react-native'
import React, { useEffect, useState } from 'react'
import color from '../../config/color'
import Header from '../../components/Header'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt , faGlobe} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faXTwitter, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { getContact } from '../../services/api/Contact Us/getContact';

export default function Contact({navigation}) {
  const contact = [
    {
      id: 1,
      name: "SIRAGUGAL CRS FM 89.6 MHz",
      phnNo: "+91 90929 25600",
      live_phnno_1: "9092928811",
      live_phnno_2: "9092925500",
      mailId: "siragugalcrs@gmail.com",
      address: "THE STATION DIRECTOR,\n SIRAGUGAL CRS FM 89.6 MHz,\n PANCHAMADEVI POST,\n KARUR - 639 004.",
      logo: require("../../../assets/logo/logo.png"),
      addressLink: "https://maps.app.goo.gl/QTnuAfvbHF4mDN3Q9",
      socialMedia: [
        { id: 1, icon: faFacebook, color: "#3b5998", url: "https://www.facebook.com/" },
        { id: 2, icon: faInstagram, color: "#E1306C", url: "https://www.instagram.com/siragugalcrsfm/profilecard/?igsh=MnY5emZkM3lld2d4" },
        { id: 3, icon: faXTwitter, color: "#000", url: "https://x.com/siragugalcrs?t=7UPPFEzv2HsYC-1mlT4WBQ&s=09" },
        { id: 4, icon: faWhatsapp, color: "#25D366", url: "https://wa.me/9092928811" },
        { id: 5, icon: faYoutube, color: "#FF0000", url: "https://youtube.com/@siragugalcrs" },
        { id: 6, icon: faGlobe, color: "#1DA1F2", url: "http://siragugalcrs.in" },
      ],
    }
  ];

  const [contactus, setContactus] = useState({})
  // console.log("contact", contactus)
  
  // console.log("contact us page is here", contactus[0].project_title)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [])

  const fetchContact = async () => {
    try {
      const response = await getContact();
      setContactus(response.data)
    }
    catch {
      console.error("Failed to fetch contact", error);
    } 
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handlePhonePress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleSocialMediaPress = (url) => {
    Linking.openURL(url);
  };

  const handleAddressPress = (addressLink) => {
    Linking.openURL(addressLink); 
  };

  const onRefresh = () => {
    setRefreshing(true); 
    fetchContact();
  };
  
  return (
    <View className="flex-1" style={{ backgroundColor: color.shadow }}>
      <Header screen_name="Contact us" navigation={navigation}/>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 rounded-t-3xl mt-3" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {contactus.length > 0 ? (
            contactus.map((item, idx) => (
              <View key={idx} className="mt-1 p-5">
                <Image
                    source={{uri: item.logo_image}}
                    style={{ width: 100, height: 100, borderRadius: 10, alignSelf: 'center' }}
                    resizeMode="cover"
                />
                <Text className="text-center text-lg font-bold mt-3" style={{color: color.primary}}>
                  {item.project_title}
                </Text>
                <TouchableOpacity style={{minHeight: 48, minWidth: 48,}} activeOpacity={0.6} onPress={() => handleAddressPress(item.links.map_link)} className="flex-row items-center mt-5">
                  <FontAwesomeIcon icon={faMapMarkerAlt} color={color.primary} />
                  <Text className="ml-2 text-gray-600 text-base">{item.address}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{minWidth: 48,minHeight: 48}} activeOpacity={0.6} onPress={() => handlePhonePress(item.phone_number)} className="flex-row items-center mt-5">
                  <FontAwesomeIcon icon={faPhone} color={color.primary} />
                  <Text className="ml-2 text-gray-600 text-base">{item.phone_number}</Text>
                </TouchableOpacity>
                <Text className="ml-2 text-black text-sm mt-5 font-bold text-base">For live call</Text>
                {Object.values(item.live_phone_number).map((phnNo, idx) => (
                  <TouchableOpacity style={{minWidth: 48,minHeight: 48}} key={idx} activeOpacity={0.6} onPress={() => handlePhonePress(phnNo)} className="flex-row items-center mt-5">
                    <FontAwesomeIcon icon={faPhone} color={color.primary} />
                    <Text className="ml-2 text-gray-600 text-base">{phnNo}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={{minWidth: 48,minHeight: 48}} activeOpacity={0.6} onPress={() => handleMailPress(item.mail_id)} className="flex-row items-center mt-5">
                    <FontAwesomeIcon icon={faEnvelope} color={color.primary} />
                    <Text className="ml-2 text-gray-600 text-base">{item.mail_id}</Text>
                </TouchableOpacity>
                <View className="mt-10">
                  <View className="flex-row justify-center">
                      <Text className="font-bold text-lg" style={{color: color.primary}}>Follow Us</Text>
                  </View>
                  <View className="flex-row justify-around mt-5">
                    {[
                      { id: 1, icon: faFacebook, lable: "Facebook", color: '#3b5998', url: item.links.facebook_link },
                      { id: 2, icon: faInstagram, lable: "Instagram", color: '#E1306C', url: item.links.instagram_link },
                      { id: 3, icon: faXTwitter, lable: "Twitter", color: '#000', url: item.links.x_link },
                      { id: 4, icon: faWhatsapp, lable: "WhatsApp", color: '#1b9849', url: item.links.whatsapp_link },
                    ].map((social) => (
                      <TouchableOpacity key={social.id} activeOpacity={0.6} onPress={() => handleSocialMediaPress(social.url)} className="justify-center items-center" style={{minHeight: 48}}>
                        <FontAwesomeIcon icon={social.icon} size={30} color={social.color} />
                        <Text  className="text-base font-bold mt-2 text-center" style={{color: social.color}}>{social.lable}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View className="flex-row justify-around mt-5">
                    {[
                      { id: 1, icon: faYoutube, lable: "Youtube", color: '#FF0000', url: item.links.youtube_link },
                      { id: 2, icon: faGlobe, lable: "Website", color: '#1DA1F2', url: item.links.website_link },
                    ].map((social) => (
                      <TouchableOpacity key={social.id} activeOpacity={0.6} onPress={() => handleSocialMediaPress(social.url)} className="justify-center items-center" style={{minHeight: 48}}>
                        <FontAwesomeIcon icon={social.icon} size={30} color={social.color} />
                        <Text  className="text-base font-bold mt-2 text-center" style={{color: social.color}}>{social.lable}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
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