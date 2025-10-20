import { useEffect, useState } from 'react';
import { Company } from '@/models/Company';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Person} from "@/models/Person";

export const usePerson = () => {
    const [person, setPerson] = useState<Person>();
    const [personLoading, setLoading] = useState(true);
    const [jwt, setJwt] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('jwt').then(token => setJwt(token));
    }, []);

    useEffect(() => {
        if (jwt == null) {
            setLoading(false);
            setPerson(undefined);
            return;
        }
        fetch('https://kodrf.ru/personal_account', {
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + jwt,
            },
        })
            .then((r) => r.json())
            .then(setPerson)
            .finally(() => setLoading(false));
    }, []);

    return {person, personLoading}
};
