import { View, Text } from 'react-native';
import React from 'react';
import AppNavigation from './src/navigation/AppNavigation';
import { AudioProvider } from './src/context/AudioContext';

export default function App() {
  return (
    <AudioProvider>
      <AppNavigation />
    </AudioProvider>
  );
}