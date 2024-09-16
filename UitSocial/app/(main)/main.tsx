import { StyleSheet, View, Animated } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Home from "../(main)/home"; // Đảm bảo đường dẫn chính xác
import Message from "../(main)/newPost"; // Thay thế bằng component tương ứng
import Profile from "../(main)/profile"; // Thay thế bằng component tương ứng

const Tab = createBottomTabNavigator();

const Main = () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [translateY, setTranslateY] = useState(new Animated.Value(0));

    // Điều chỉnh navbar ẩn/hiện khi cuộn
    useEffect(() => {
        const listenerId = scrollY.addListener(({ value }) => {
            Animated.timing(translateY, {
                toValue: value > 50 ? 100 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            scrollY.removeListener(listenerId);
        };
    }, [scrollY]);

    return (
        <NavigationContainer>
            <View style={{ flex: 1 }}>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;
                            if (route.name === 'Home') {
                                iconName = 'home';
                            } else if (route.name === 'Message') {
                                iconName = 'message-circle';
                            } else if (route.name === 'Profile') {
                                iconName = 'user';
                            }
                            return <Icon name={'home'} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: 'blue',
                        tabBarInactiveTintColor: 'black',
                        tabBarStyle: {
                            backgroundColor: 'white',
                            height: 60,
                            borderTopWidth: 1,
                            borderColor: '#ddd',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            transform: [{ translateY: translateY }],
                        },
                    })}
                >
                    <Tab.Screen name="Home" component={Home} />
                    <Tab.Screen name="Message" component={Message} />
                    <Tab.Screen name="Profile" component={Profile} />
                </Tab.Navigator>
            </View>
        </NavigationContainer>
    );
};

export default Main;

const styles = StyleSheet.create({});
