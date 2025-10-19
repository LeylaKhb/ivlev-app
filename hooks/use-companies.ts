import { useEffect, useState } from 'react';
import { Company } from '@/models/Company';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [jwt, setJwt] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('jwt').then(token => setJwt(token));
    }, []);

    useEffect(() => {
        fetch('https://kodrf.ru/api/companies', {
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + jwt,
            },
        })
            .then((r) => r.json())
            .then(setCompanies)
            .finally(() => setLoading(false));
    }, []);

    return { companies, loading };
};
