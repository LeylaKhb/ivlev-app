import {Tabs} from 'expo-router';
import React from 'react';

import {HapticTab} from '@/components/haptic-tab';
import {IconSymbol} from '@/components/ui/icon-symbol';
import {Colors} from '@/constants/theme';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {AppDataProvider} from "@/contexts/AppDataContext";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors['light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Главная',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="house.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Расписание',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="calendar" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="news"
                options={{
                    title: 'Новости',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="newspaper" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Профиль',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="person.crop.circle" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'Ещё',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="ellipsis.circle" color={color}/>,
                }}
            />
        </Tabs>
    );
}
