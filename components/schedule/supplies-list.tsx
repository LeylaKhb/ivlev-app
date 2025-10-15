import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { format } from 'date-fns';
import {Supply} from "@/models/Supply"; // удобная библиотека для форматирования дат

interface SupplyItemProps {
    supply: Supply;
}

export const SupplyItem: React.FC<SupplyItemProps> = ({ supply }) => {
    const departureDate = new Date(supply.departureDate);
    const acceptanceDate = new Date(supply.acceptanceDate);

    function getWeekDay(date: Date) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    }

    const departureDateStr = departureDate.toISOString().split('T')[0]; // "1970-01-01"

    const renderDateBlock = () => {
        if (departureDateStr === '1970-01-01') {
            return (
                <View style={styles.dateBlock}>
                    <ThemedText style={styles.departureDate}>Вт, Ср, Пт, Сб</ThemedText>
                </View>
            );
        }

        if (departureDateStr === '1980-01-01' || departureDateStr === '1990-01-01') {
            return (
                <View style={styles.dateBlock}>
                    <ThemedText style={styles.departureDate}>
                        Пн, Вт, Ср,
                    </ThemedText>
                    <ThemedText style={styles.departureDate}>Чт, Пт, Сб</ThemedText>
                </View>
            );
        }

        return (
            <View style={styles.dateBlock}>
                <ThemedText style={styles.departureDate}>
                    {format(departureDate, 'dd.MM.yy')} ({getWeekDay(departureDate)})
                </ThemedText>
                <ThemedText style={styles.acceptanceDate}>
                    Приём до {format(acceptanceDate, 'dd.MM')}
                </ThemedText>
            </View>
        );
    };

    return (
        <View style={styles.itemContainer}>
            {/* Левая колонка (дата / дни недели) */}
            <View style={styles.leftColumn}>{renderDateBlock()}</View>

            {/* Правая колонка (название склада или направление) */}
            <View style={styles.rightColumn}>
                <ThemedText style={styles.title}>{supply.title}</ThemedText>
            </View>
        </View>
    );
};

export const SupplyList: React.FC<{ supplies: Supply[] }> = ({ supplies }) => {
    return (
        <FlatList
            data={supplies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <SupplyItem supply={item} />}
            contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        padding: 14,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#fff', // можно заменить на useThemeColor для темной темы
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2, // для Android
    },
    leftColumn: {
        width: "40%",
        justifyContent: 'center',
    },
    departureDate: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    acceptanceDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        textAlign: "left",
    },
    rightColumn: {
        width: "60%",
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    warehouse: {
        fontSize: 14,
        fontWeight: '500',
    },
    dateBlock: {
        justifyContent: 'center',
    },
});
