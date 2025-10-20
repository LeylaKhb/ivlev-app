// AppDataContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person } from '@/models/Person';
import { Company } from '@/models/Company';

type AppDataContextType = {
    jwt: string | null;
    person: Person | null;
    companies: Company[] | null;
    loading: boolean; // initial load
    personCompaniesLoading: boolean; // background person/companies loading
    setJwt: (token: string | null) => Promise<void>;
    refreshPersonAndCompanies: (token?: string | null) => Promise<void>;
    logout: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jwt, setJwtState] = useState<string | null>(null);
    const [person, setPerson] = useState<Person | null>(null);
    const [companies, setCompanies] = useState<Company[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [personCompaniesLoading, setPersonCompaniesLoading] = useState(false);

    // helper to persist jwt
    const persistJwt = useCallback(async (token: string | null) => {
        if (token) {
            await AsyncStorage.setItem('jwt', token);
        } else {
            await AsyncStorage.removeItem('jwt');
        }
        setJwtState(token);
    }, []);

    const fetchPersonAndCompanies = useCallback(async (token: string | null) => {
        setPersonCompaniesLoading(true);
        if (!token) {
            setPerson(null);
            setCompanies([]);
            setPersonCompaniesLoading(false);
            return;
        }

        try {
            const [personData, companiesData] = await Promise.all([
                fetch('https://kodrf.ru/personal_account', {
                    headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
                }).then(r => r.json()),
                fetch('https://kodrf.ru/api/companies', {
                    headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
                }).then(r => r.json()),
            ]);

            setPerson(personData ?? null);
            setCompanies(Array.isArray(companiesData) ? companiesData : []);
            // optional: cache to AsyncStorage if you want fast startup next time
            await AsyncStorage.setItem('cached_person', JSON.stringify(personData ?? null));
            await AsyncStorage.setItem('cached_companies', JSON.stringify(companiesData ?? []));
        } catch (e) {
            console.error('fetchPersonAndCompanies error', e);
        } finally {
            setPersonCompaniesLoading(false);
        }
    }, []);

    // Public: setJwt wrapper that persists + triggers refresh
    const setJwt = useCallback(
        async (token: string | null) => {
            await persistJwt(token);
            // immediately refresh person/companies when jwt changes
            await fetchPersonAndCompanies(token);
        },
        [persistJwt, fetchPersonAndCompanies]
    );

    // Exposed refresh method (optional token override)
    const refreshPersonAndCompanies = useCallback(
        async (token?: string | null) => {
            const t = token ?? jwt;
            await fetchPersonAndCompanies(t ?? null);
        },
        [fetchPersonAndCompanies, jwt]
    );

    const logout = useCallback(async () => {
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('admin');
        // optionally clear cached_person/companies if you cached them
        // await AsyncStorage.removeItem('cached_person');
        // await AsyncStorage.removeItem('cached_companies');
        setJwtState(null);
        setPerson(null);
        setCompanies([]);
    }, []);

    // Initial boot: load cached values + jwt, then refresh in background
    useEffect(() => {
        (async () => {
            try {
                const [token, cachedPersonRaw, cachedCompaniesRaw] = await Promise.all([
                    AsyncStorage.getItem('jwt'),
                    AsyncStorage.getItem('cached_person'),
                    AsyncStorage.getItem('cached_companies'),
                ]);

                if (token) {
                    setJwtState(token);
                }

                if (cachedPersonRaw) {
                    try { setPerson(JSON.parse(cachedPersonRaw)); } catch { /* ignore */ }
                }
                if (cachedCompaniesRaw) {
                    try { setCompanies(JSON.parse(cachedCompaniesRaw)); } catch { /* ignore */ }
                }
            } catch (e) {
                console.error('AppDataProvider init error', e);
            } finally {
                // UI can render quickly with cached data
                setLoading(false);
                // fetch fresh person/companies in background (if there is token)
                const token = await AsyncStorage.getItem('jwt');
                if (token) {
                    fetchPersonAndCompanies(token);
                }
            }
        })();
    }, [fetchPersonAndCompanies]);

    return (
        <AppDataContext.Provider
            value={{
                jwt,
                person,
                companies: companies ?? [],
                loading,
                personCompaniesLoading,
                setJwt,
                refreshPersonAndCompanies,
                logout,
            }}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = (): AppDataContextType => {
    const ctx = useContext(AppDataContext);
    if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
    return ctx;
};
