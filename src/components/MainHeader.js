import { View, Text, TouchableOpacity , Image} from 'react-native'
import { Bars3Icon } from 'react-native-heroicons/solid';
import React, {useState} from 'react'
import color from '../config/color'
import SideBar from './SideBar';

export default function MainHeader({screen_name, navigation}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <View className="flex-row rounded-b-lg" style={{ backgroundColor: color.primary }}>
            <View className="flex-row flex-1 mt-3 mb-2">
                <View style={{ flex: 0.9, color: '#fff' }} className="p-3">
                    <View className="flex-1 flex-row justify-start item-center">
                        <Image className="flex-column content-center self-center"
                            source={require("../../assets/logo/logo.png")}
                            style={{ height: 50, width: 50, objectFit: 'contain' }}
                        />
                        <Text className="flex-column content-center self-center text-base font-bold text-white ml-2">
                            SIRAGUGAL CRS FM 89.6 MHz
                        </Text>
                    </View>
                </View>
                <TouchableOpacity activeOpacity={0.6} onPress={() => setIsSidebarOpen(!isSidebarOpen)} className="flex-start p-3 ml-3" style={{ flex: 0.1, minHeight: 48 }}>
                    <Bars3Icon color={color.white} size={25} />
                </TouchableOpacity>
            </View>
            {/* Sidebar Component */}
            <SideBar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                navigation={navigation}
            />
        </View>
    )
}