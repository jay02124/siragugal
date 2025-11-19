import React, { useRef, useEffect, useState } from 'react';
import { FlatList, Image, View, Dimensions, Text, StyleSheet, TouchableOpacity } from 'react-native';
import color from '../config/color';

const { width } = Dimensions.get('window');

export default function ImgAutoSlide({ img_slider, height }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  let intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % img_slider.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, img_slider]);

  const handleScroll = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 20));
    setCurrentIndex(newIndex);
  };

  return (
    <View style={{ height, overflow: 'hidden', paddingHorizontal: 10 }}>
      {img_slider && img_slider.length > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={img_slider}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.logo_image }}
                style={{
                  width: width - 20,
                  height,
                  borderRadius: 30,
                  borderWidth: 4,
                  borderColor: color.primary,
                  resizeMode: 'cover',
                }}
              />
            )}
          />
          {/* Custom Indicator */}
          <View style={styles.indicatorContainer}>
            {img_slider.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentIndex(index);
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }}
                style={[
                  styles.dot,
                  currentIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ textAlign: 'center', color: 'black', fontSize: 12, fontWeight: 'bold' }}>
            No Slider Image available
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: color.primary,
  },
  inactiveDot: {
    backgroundColor: color.shadow,
  },
});
