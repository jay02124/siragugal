import { View, Text, TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import React from 'react'
import color from '../config/color'

export default function Header({screen_name, navigation, icon}) {
    return (
        <View className="flex-row rounded-bl-full" style={{ backgroundColor: color.primary }}>
            <TouchableOpacity activeOpacity={0.6} className="ml-8 flex-row"  style={{minHeight: 48, minWidth: 68, alignItems: 'center',justifyContent: 'center'}} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon size={20} icon={faChevronLeft} color={color.white} />
            </TouchableOpacity>
            <View className="ml-6 flex-row items-center">
                {/* {icon && (
                    <FontAwesomeIcon
                        icon={icon}
                        size={20}
                        style={{ marginLeft: 5 }}
                        color={color.secondary}
                    />
                )} */}
                <Text className="font-bold p-3 text-lg" style={{ color: color.white }}>
                    {screen_name}
                </Text>
            </View>
        </View>
    )
}