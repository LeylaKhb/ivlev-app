import React, {useEffect, useState} from 'react';
import {FlatList, View, StyleSheet, Pressable, Modal} from 'react-native';
import {ThemedText} from '@/components/themed-text';
import {format} from 'date-fns';
import {Supply} from "@/models/Supply";
import {Link} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTabEffect} from "@/hooks/use-tab-effect";
import {useCompanies} from "@/hooks/use-companies";
import {usePerson} from "@/hooks/use-person";
import {Company} from "@/models/Company";
import {Person} from "@/models/Person";

interface SupplyItemProps {
    supply: Supply;
    companies: Company[] | null;
    person: Person | null;
}

export const SupplyItem: React.FC<SupplyItemProps> = ({supply, companies, person}) => {
    const departureDate = new Date(supply.departureDate);
    const acceptanceDate = new Date(supply.acceptanceDate);

    function getWeekDay(date: Date) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    }

    const departureDateStr = departureDate.toISOString().split('T')[0];

    const renderDateBlock = () => {
        if (departureDateStr === '1970-01-01') {
            return (
                <View style={styles.dateBlock}>
                    <ThemedText style={styles.departureDate}>Вт, Ср,</ThemedText>
                    <ThemedText style={styles.departureDate}>Пт, Сб</ThemedText>

                </View>
            );
        }

        if (departureDateStr === '1980-01-01' || departureDateStr === '1990-01-01') {
            return (
                <View style={styles.dateBlock}>
                    <ThemedText style={styles.departureDate}>Пн, Вт, Ср,</ThemedText>
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

    if (person === undefined || person === null) {
        return (
            <Link href="/auth-modal" asChild>
                <Pressable style={styles.itemContainer}>
                    <View style={styles.leftColumn}>{renderDateBlock()}</View>
                    <View style={styles.rightColumn}>
                        <ThemedText style={styles.title}>{supply.title}</ThemedText>
                    </View>
                </Pressable>
            </Link>
        );
    }

    if (companies === null || companies.length === 0) {
        return (
            <Link
                href={{
                    pathname: '/companies',
                    params: {jsonPerson: JSON.stringify(person)},
                }}
                asChild
            >
                <Pressable style={styles.itemContainer}>
                    <View style={styles.leftColumn}>{renderDateBlock()}</View>
                    <View style={styles.rightColumn}>
                        <ThemedText style={styles.title}>{supply.title}</ThemedText>
                    </View>
                </Pressable>
            </Link>
        );
    }
    return (
        <Link
            href={{
                pathname: '/modal/[id]',
                params: {id: supply.id.toString(), jsonSupply: JSON.stringify(supply)},
            }}
            asChild
        >
            <Pressable style={styles.itemContainer}>
                <View style={styles.leftColumn}>{renderDateBlock()}</View>
                <View style={styles.rightColumn}>
                    <ThemedText style={styles.title}>{supply.title}</ThemedText>
                </View>
            </Pressable>
        </Link>
    );
}


export const SupplyList: React.FC<{ supplies: Supply[], companies: Company[] | null, person: Person | null }>
    = ({supplies, companies, person}) => {
    return (
        <FlatList
            data={supplies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => <SupplyItem supply={item} person={person} companies={companies}/>}
            contentContainerStyle={{paddingBottom: 80}}
        />
    );
};

const styles = StyleSheet.create({
            itemContainer: {
                flexDirection: 'row',
                padding: 14,
                marginBottom: 10,
                borderRadius: 8,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                shadowOffset: {width: 0, height: 2},
                elevation: 2,
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
            dateBlock: {
                justifyContent: 'center',
            },
            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContent: {
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 12,
                width: '80%',
                alignItems: 'center',
            },
            modalTitle: {
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 20,
            },
            closeButton: {
                backgroundColor: '#007AFF',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
            },
            closeButtonText: {
                color: '#fff',
                fontWeight: '600',
                fontSize: 16,
            },
        }
    )
;
