import React, {useEffect, useState, useCallback} from 'react';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SegmentedControl} from '@/components/segmented-control';
import {SupplyList} from '@/components/schedule/supplies-list';
import {useTabEffect} from '@/hooks/use-tab-effect';
import {Supply} from '@/models/Supply';
import {Company} from '@/models/Company';
import {Person} from '@/models/Person';
import {useAppData} from "@/contexts/AppDataContext";

export default function ScheduleScreen() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { person, companies, loading: appLoading, personCompaniesLoading, refreshPersonAndCompanies, jwt } = useAppData();
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [allSupplies, setAllSupplies] = useState<Supply[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // schedule can be loaded independently here (or also moved to contexts)
        (async () => {
            try {
                const res = await fetch('https://kodrf.ru/api/schedule', { headers: { Accept: 'application/json' } });
                const data = await res.json();
                setAllSupplies(data);
                setSupplies(data.filter((s: Supply) => !s.ozon));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /**
     * Переключение WB / OZON
     */
    const handleSegmentChange = (index: number) => {
        setSelectedIndex(index);
        const filtered = allSupplies.filter(s => index === 0 ? !s.ozon : s.ozon);
        setSupplies(filtered);
    };

    if (loading || personCompaniesLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#b752c9" />
            </View>
        );
    }

    return (
        <View style={{padding: 20}}>
            <SegmentedControl
                options={['WB', 'OZON / ЯМ / ТК']}
                onChange={handleSegmentChange}
                style={{marginBottom: 15}}
                selectedIndex={selectedIndex}
            />
            <SupplyList supplies={supplies} companies={companies} person={person} />
        </View>
    );
}
