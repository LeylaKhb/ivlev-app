import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Linking,
    Alert,
    StyleSheet,
    Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppData } from '@/contexts/AppDataContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { person, companies, loading, personCompaniesLoading, logout } = useAppData();

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7b1fa2" />
            </View>
        );
    }

    // Если данные ещё подгружаются — показываем спиннер (чтобы не открывать auth-modal по случайному null)
    if ((person === undefined || person === null) && personCompaniesLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7b1fa2" />
            </View>
        );
    }

    if (person === undefined || person === null) {
        return (
            <Link href="/auth-modal" asChild>
                <Pressable style={styles.authPressable}>
                    <View style={styles.profileCard}>
                        <View style={styles.profileInfo}>
                            <Image source={require('@/assets/user_profile.png')} style={styles.avatar} />
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.name}>Войдите в аккаунт</Text>
                                <Text style={styles.email}>Нажмите, чтобы авторизоваться и увидеть профиль</Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Link>
        );
    }

    // Иначе — обычный профиль
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* ---------- Профиль ---------- */}
            <View style={styles.profileCard}>
                <View style={styles.profileInfo}>
                    <Image source={require('@/assets/user_profile.png')} style={styles.avatar} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.name}>{person.name}</Text>
                            <TouchableOpacity onPress={() => router.push('/edit-profile')} style={{ marginLeft: 10 }}>
                                <IconSymbol name="pencil" size={20} color="#7b1fa2" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.email}>{person.email}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={{ marginLeft: 10 }}>
                        <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color="#c62828" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.companiesButton} onPress={() => router.push('/companies')}>
                    <Text style={styles.companiesButtonText}>Мои компании</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.linksCard}>
                <TouchableOpacity style={styles.linkButtonPrimary} onPress={() => router.push('/current-orders')}>
                    <Text style={styles.linkButtonTextPrimary}>Текущие заявки</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButtonSecondary} onPress={() => router.push('/orders-history')}>
                    <Text style={styles.linkButtonTextSecondary}>История заказов</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authPressable: {
        // Pressable занимает весь экран-область, можно настроить иначе
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#f9f9f9',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    email: {
        fontSize: 13,
        color: 'gray',
        marginTop: 4,
    },
    companiesButton: {
        backgroundColor: '#eaeaea',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    companiesButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    linksCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    linkButtonPrimary: {
        backgroundColor: '#7b1fa2',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    linkButtonTextPrimary: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
    linkButtonSecondary: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 16,
        borderRadius: 16,
    },
    linkButtonTextSecondary: {
        color: '#333',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
});
