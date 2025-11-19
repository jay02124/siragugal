import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';
import color from '../config/color';
import { getPopupAd } from '../services/api/Popup Ad/getPopupAd';

const PopupAd = ({ isVisible, onClose }) => {
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPopupAd = async () => {
    try {
      const response = await getPopupAd();
      setAdvertisement(response.data);
    } catch (error) {
      console.error("Failed to fetch advertisement", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchPopupAd();
    }
  }, [isVisible]);

  const closeModal = () => {
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
        <View className="w-10/12 max-w-lg bg-white rounded-xl overflow-hidden shadow-lg">
          <View className="p-4 flex-row items-center justify-end mr-2" style={{ backgroundColor: color.white}}>
            <TouchableOpacity onPress={closeModal} className="flex-row items-center" style={{minHeight: 48, minWidth: 48,paddingHorizontal: 8 }}>
              <Text className="font-bold text-sm mr-2" style={{color: color.danger}}>CLOSE</Text>
              <View className="rounded-lg my-2" style={{backgroundColor: color.danger}}>
                <XMarkIcon size={22} color={color.white} />
              </View>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View className="p-10 items-center">
              <ActivityIndicator size="large" color={color.primary} />
            </View>
          ) : advertisement && advertisement[0].popup_image ? (
            <Image
              source={{ uri: advertisement[0].popup_image }}
              style={{height: 350, objectFit: "contain"}}
              className="w-full mb-3"
            />
          ) : (
            <View className="p-10 items-center">
              <Text className="text-center text-black text-sm" >No Advertisement Available</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PopupAd;
