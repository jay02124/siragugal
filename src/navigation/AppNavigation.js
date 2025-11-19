import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/Splash Screen';
import BottomNavigation from './BottomNavigation';
import Home from '../screens/Home';
import Podcast from '../screens/Podcast';
import SongRequest from '../screens/SongRequest';
import Youtube from '../screens/Youtube';
import About from '../screens/About us';
import Contact from '../screens/Contact us';
import ImgAutoSlide from '../components/ImgAutoSlide';
import SideBar from '../components/SideBar';
import Header from '../components/Header';
import color from '../config/color';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import TermsCondition from '../screens/TermsCondition';
import MainHeader from '../components/MainHeader';
import YoutubePlayer from '../screens/Youtube/player';
import PopupAd from '../components/PopupAd';

const Stack = createNativeStackNavigator();


export default function AppNavigation() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, statusBarColor: color.primary, statusBarStyle: "light-content"  }} initialRouteName='Splash'>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Podcast" component={Podcast} />
        <Stack.Screen name="SongRequest" component={SongRequest} />
        <Stack.Screen name="Youtube" component={Youtube} />
        <Stack.Screen name="YoutubePlayer" component={YoutubePlayer} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="TermsCondition" component={TermsCondition} />
        <Stack.Screen name="ImgAutoSlide" component={ImgAutoSlide} />
        <Stack.Screen name="SideBar" component={SideBar} />
        <Stack.Screen name="Header" component={Header} />
        <Stack.Screen name="MainHeader" component={MainHeader} />
        <Stack.Screen name="PopupAd" component={PopupAd} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
