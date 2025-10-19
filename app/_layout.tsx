import {
    DarkTheme,
    DefaultTheme,
    getFocusedRouteNameFromRoute, ParamListBase,
    RouteProp,
    ThemeProvider
} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/use-color-scheme';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    function getHeaderTitle(route: RouteProp<ParamListBase, string>) {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Главная';

        switch (routeName) {
            case 'index':
                return 'Главная';
            case 'profile':
                return 'Профиль';
            case 'schedule':
                return 'Расписание';
            case 'news':
                return 'Новости';
            case 'more':
                return 'Ещё';
        }
    }

    return (
        <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}>
                <Stack.Screen
                    name="(tabs)"
                    options={({ route }) => ({
                        headerTitle: getHeaderTitle(route),
                    })}
                />
                <Stack.Screen name="auth-modal" options={{ presentation: 'modal', title: 'Авторизация' }} />
                <Stack.Screen name="modal" options={{ title: 'Заявка на поставку' }} />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
