import React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function YoutubePlayer({ route }) {
  const { videoUrl } = route.params;

  return (
    <View className='flex-1'>
      {videoUrl ? (
        <WebView
          source={{ uri: videoUrl }}
          style={{ flex: 1 }}
        />
      ) : (
        <Text className="flex-1 justify-center items-center">No video URL provided.</Text>
      )}
    </View>
  );
}
