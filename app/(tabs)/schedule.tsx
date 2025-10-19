import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, ScrollView, View} from 'react-native';
import {SegmentedControl} from '@/components/segmented-control';
import {ThemedText} from "@/components/themed-text";
import {Supply} from "@/models/Supply";
import {SupplyList} from "@/components/schedule/supplies-list";
import {useTabEffect} from "@/hooks/use-tab-effect";

export default function ScheduleScreen() {
    const [allSupplies, setAllSupplies] = useState<Supply[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch('https://kodrf.ru/api/schedule', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const data = await response.json();
                const filtered = data.filter((supply: Supply) => !supply.ozon);

                setAllSupplies(data);
                setSupplies(filtered);
            } catch (error) {
                console.error('Ошибка при загрузке расписания:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#b752c9"/>
            </View>
        );
    }

    return (
        <View style={{padding: 20}}>
            <SegmentedControl
                options={['WB', 'OZON / ЯМ / ТК']}
                onChange={(index) => {
                    const filtered = allSupplies.filter((s) => index === 0 ? !s.ozon : s.ozon);
                    setSupplies(filtered);
                }}
                style={{marginBottom: 15}}
            />
            <SupplyList supplies={supplies}/>
        </View>
    );
}