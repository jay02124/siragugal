import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking ,Share, BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faStar, faShareAlt, faMusic, faPodcast, faVideo } from '@fortawesome/free-solid-svg-icons';
import color from '../config/color';
import Home from '../screens/Home';
import Podcast from '../screens/Podcast';
import SongRequest from '../screens/SongRequest';
import Youtube from '../screens/Youtube';

const Tab = createBottomTabNavigator();

const icons = {
  Home: faHome,       
  Podcast: faPodcast,      
  SongRequest: faMusic,   
  Youtube: faVideo,
}

const labels = {
  Home: 'Home',
  Podcast: 'Podcast',
  SongRequest: 'Song Request',
  Youtube: 'Youtube',
};



const CustomTabBar = ({ state, descriptors, navigation }) => {
  // const [showFloatingIcons, setShowFloatingIcons] = useState(false);

  const handlePress = (route, isFocused) => {
    // setShowFloatingIcons(false);
    if (!isFocused) {
      navigation.navigate(route.name);
    }
    
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App, ',' Do you want to exit?',
        [
          {
            text:('Cancel'),
            onPress: () => null,
            style: 'cancel',
          },
          { text: ('OK'), onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (navigation.isFocused()) {
          return backAction();
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={() => handlePress(route, isFocused)}
            style={[styles.tabButton, isFocused && styles.tabButtonFocused]}
          >
            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
              {isFocused ? (
                <>
                  <FontAwesomeIcon icon={icons[route.name]} color={isFocused ? color.primary : color.inactiveTab} size={16} />
                  <Text style={[styles.label, {color: isFocused ? color.primary :  color.white , marginLeft: isFocused ? 10 : 1 }]}>
                    {labels[route.name]}
                  </Text>
                </>
              ) : (
                <View className="flex-column justify-center items-center">
                  <FontAwesomeIcon icon={icons[route.name]} color={isFocused ? color.primary : color.inactiveTab} size={16} />
                  <Text style={[styles.label, {color:  color.white , marginTop: 5}]}>
                    {labels[route.name]}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      
    </View>
  );
};

export default function BottomNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Podcast" component={Podcast} />
      <Tab.Screen name="SongRequest" component={SongRequest} />
      <Tab.Screen name="Youtube" component={Youtube} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 1,
    left: 1,
    right: 1,
    backgroundColor: color.primary,
    borderRadius: 50,
    height: 60,
    paddingHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48
  },
  tabButtonFocused: {
    flex: 1.5, 
    minHeight: 48,
    minWidth: 48,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  iconContainerFocused: {
    backgroundColor: color.secondary,
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 8,
    shadowColor: '#cce6ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 30,
    paddingHorizontal: 20
  },
  label: {
    color: color.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  floatingIconsContainer: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  floatingIcon: {
    backgroundColor: color.secondary,
    borderRadius: 20,
    padding: 10,
    marginBottom: 10, 
    shadowColor: '#cce6ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    borderColor: color.primary,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  floatingIconContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingIconText: {
    color: color.primary,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
