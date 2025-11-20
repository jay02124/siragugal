import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image, Share, ScrollView, Linking } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPodcast, faMusic, faInfoCircle, faPhone, faShareAlt, faFileContract, faLock, faVideo } from '@fortawesome/free-solid-svg-icons';
import color from '../config/color';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Utility: make numbers responsive by scale
const guidelineBaseWidth = 375; // iPhone X width as baseline
const guidelineBaseHeight = 812; // iPhone X height

const scale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

const SideBar = ({ navigation, isOpen, onClose }) => {
  const { width } = Dimensions.get('window');
  const sidebarWidth = width / 1.5;
  const [expandedItem, setExpandedItem] = useState(null);

  const blinkAnimation = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Blinking effect for the Announcement text
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [blinkAnimation]);

  if (!isOpen) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this awesome FM app!\n SIRAGUGAL CRS FM \nhttps://play.google.com/store/apps/details?id=com.wingstrust.siragugalfm',
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePress = async () => {
    const phoneNumber = '9192928811';
    const message = 'Hello! I would like to request a song.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(err => {
      console.error('Error opening WhatsApp', err);
      Alert.alert('Error', 'Failed to open WhatsApp.');
    });
  };

  const sideMenu = [
    // {
    //   title: 'Home',
    //   icon: faHome,
    //   route: 'Home',
    // },
    // {
    //   title: 'Podcast',
    //   icon: faPodcast,
    //   route: 'Podcast',
    // },
    // {
    //   title: 'Song Request',
    //   icon: faMusic,
    //   route: 'SongRequest',
    // },
    // {
    //   title: 'YouTube',
    //   icon: faVideo,
    //   route: 'Youtube',
    // },
    {
      title: 'About Us',
      icon: faInfoCircle,
      route: 'About',
    },
    {
      title: 'Contact Us',
      icon: faPhone,
      route: 'Contact',
    },
    {
      title: 'Share',
      icon: faShareAlt,
      actionPerform: handleShare,
    },
    {
      title: 'Announcement',
      icon: faFileContract,
      route: 'TermsCondition',
    },
    {
      title: 'Privacy Policy',
      icon: faLock,
      route: 'PrivacyPolicy',
    },
  ];

  const toggleExpand = (item) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  const handleMenuItemPress = (item) => {
    if (item.actionPerform) {
      item.actionPerform(); 
    } else {
      navigation.navigate(item.route); 
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.overlay} />
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <ScrollView style={{marginBottom: 90}}>
          <View style={styles.logoContainer}>
            <View style={styles.logo_main}>
              <Image
                source={require("../../assets/logo/logo.png")}
                style={styles.logo}
              />
            </View>
          </View>
          <View className="mt-2">
            {sideMenu.map((item, index) => (
              <View key={index} style={styles.parentItem}>
                {item.subItems ? (
                  <>
                    <TouchableOpacity activeOpacity={0.6} style={styles.parentItemContent} onPress={() => toggleExpand(item.title)}>
                      <View style={styles.parentItemTextContainer}>
                        <View style={{backgroundColor: color.shadow}} className="justify-center items-center p-2 rounded-3xl">
                          <FontAwesomeIcon icon={item.icon} color={color.primary} />
                        </View>
                        <Text style={[styles.itemText, styles.parentText]}>{item.title}</Text>
                      </View>
                      <FontAwesomeIcon icon={expandedItem === item.title ? faChevronUp : faChevronDown} color={color.primary} style={styles.down} />
                    </TouchableOpacity>
                    {expandedItem === item.title && (
                      <View style={styles.subItems}>
                        {item.subItems.map((subItem, subIndex) => (
                          <TouchableOpacity key={subIndex} activeOpacity={0.6} onPress={() => navigation.navigate(subItem.route)} style={[styles.subItem, {minHeight: 48, minWidth: 48, paddingHorizontal: 8 }]}>
                            <View style={{backgroundColor: color.shadow}} className="justify-center items-center p-2 rounded-3xl">
                              <FontAwesomeIcon icon={subItem.icon} color={color.primary} />
                            </View>
                            <Text style={styles.itemText}>{item.title}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <TouchableOpacity activeOpacity={0.6} onPress={() => handleMenuItemPress(item)} style={styles.item}>
                    <View style={{backgroundColor: color.shadow}} className="justify-center items-center p-2 rounded-3xl">
                      <FontAwesomeIcon icon={item.icon} color={color.primary} />
                    </View>
                    {item.title === 'Announcement' ? (
                      <View className="flex-row justify-evenly">
                        <Text style={styles.itemText}>{item.title}</Text>
                        {/* <Animated.Text style={[styles.itemAnimation, { opacity: blinkAnimation }]}>
                          NEW
                        </Animated.Text> */}
                      </View>
                      ) : (
                      <Text style={styles.itemText}>{item.title}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    minHeight: scale(48),
  },
  sidebar: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(3.84),
    // backgroundColor: color.primary
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(30),
    backgroundColor: color.primary,
    height: verticalScale(180),
    marginBottom: verticalScale(30),
  },
  logo: {
    width: scale(175),
    height: scale(175),
    objectFit: "cover",
    padding: scale(10),
    alignItems: 'center',
    marginLeft: scale(0),
    marginTop: -verticalScale(3),
    // backgroundColor:'red'
  },
  logo_main: {
    width: scale(170),
    height: scale(170),
    borderRadius: scale(82.5), // Half of width/height
    backgroundColor: color.white,
    marginTop: verticalScale(10),
    alignItems: 'center',
  },
  item: {
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: color.shadow,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(48),
  },
  itemText: {
    fontSize: scale(16),
    color: '#333',
    fontWeight: 'bold',
    marginLeft: scale(10),
  },
  itemAnimation: {
    fontSize: scale(14),
    color: 'red',
    fontWeight: 'bold',
    marginLeft: scale(10),
  },
  icon: {
    marginRight: scale(10),
  },
  down: {
    marginLeft: 'auto',
  },
  parentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  parentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
    justifyContent: 'space-between',
    minHeight: scale(48),
    minWidth: scale(48),
  },
  parentItemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parentText: {
    color: '#333',
    fontWeight: 'bold',
  },
  subItems: {
    marginLeft: scale(50),
  },
  subItem: {
    paddingVertical: verticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  subItemText: {
    fontSize: scale(14),
    color: '#000',
    marginLeft: scale(10),
  },
});

export default SideBar;
