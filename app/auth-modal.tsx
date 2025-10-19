import React, {useState} from 'react';
import {Pressable, StyleSheet, View, TextInput, Text, Alert} from 'react-native';
import {Link, useRouter} from 'expo-router';
import {ThemedView} from '@/components/themed-view';
import {SegmentedControl} from '@/components/segmented-control';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ThemedText} from "@/components/themed-text";

export default function AuthModalScreen() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const options = ['Вход', 'Регистрация'];
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async () => {
        const isRegistration = selectedIndex === 1;

        if (isRegistration && !name.trim()) {
            Alert.alert('Ошибка', 'Введите имя');
            return;
        }
        if (!email || !password) {
            Alert.alert('Ошибка', 'Заполните email и пароль');
            return;
        }

        const person = {name, email, password};
        const url =
            isRegistration
                ? 'https://kodrf.ru/registration'
                : 'https://kodrf.ru/login';

        try {
            const resp = await fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/json', Accept: 'application/json'},
                body: JSON.stringify(person),
            });
            const data = await resp.json();

            if (data.header !== 'error') {
                // Сохраняем JWT
                const token = data.content.includes('*') ? data.content.split('*')[0] : data.content;
                const admin = data.content.includes('*') ? data.content.split('*')[1] : null;
                // AsyncStorage или SecureStore
                await AsyncStorage.setItem('jwt', token);
                if (admin) await AsyncStorage.setItem('admin', admin);

                router.dismissAll();
            } else {
                Alert.alert('Ошибка', data.content);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Ошибка', 'Не удалось выполнить запрос');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SegmentedControl options={options} selectedIndex={selectedIndex} onChange={setSelectedIndex} style={{marginBottom: 20}}/>

            {selectedIndex === 1 && (
                <TextInput
                    placeholder="Имя"
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, { color: '#000' }]}
                    placeholderTextColor="#999"
                />
            )}

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: '#000' }]}
                placeholderTextColor="#999"
            />
            <TextInput
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={[styles.input, { color: '#000' }]}
                placeholderTextColor="#999"
            />

            {/*TODO при регистрации добавить галочку Я согласен с политикой конфиденциальности*/}
            <Pressable onPress={handleSubmit} style={styles.button}>
                <ThemedText style={styles.buttonText}>
                    {selectedIndex === 0 ? 'Войти' : 'Зарегистрироваться'}
                </ThemedText>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#fff'},
    text: {marginTop: 20, textAlign: 'center'},
    input: {
        width: '80%',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#b752c9',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginTop: 15,
    },
    buttonText: {color: '#fff', fontWeight: '600'},
});
