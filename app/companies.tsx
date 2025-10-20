import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppData } from "@/contexts/AppDataContext"; // <-- контекст
import { Person } from "@/models/Person";

interface DadataResponse {
    suggestions: Array<{
        value: string;
        unrestricted_value: string;
        data: {
            inn: string;
            kpp: string;
            ogrn: string;
            name: { full_with_opf: string };
        };
    }>;
}

export default function CompaniesWindow() {
    const router = useRouter();
    const { person, jwt, refreshPersonAndCompanies } = useAppData();

    const [inn, setInn] = useState("");
    const [innError, setInnError] = useState("");
    const [fio, setFio] = useState("");
    const [fioError, setFioError] = useState("");
    const [name, setName] = useState("");
    const [isSelfEmployed, setIsSelfEmployed] = useState(false);
    const [busy, setBusy] = useState(false);

    // Dadata token — оставил твой вариант (можно вынести в env)
    const DADATA_TOKEN = "215adba17a4ff8aa543cccf6ac57bef95851caa6";
    const FNS_KEY = "050b44c5cfc2cd8e4e04bfa91d10d155b461e00b";

    const fetchCompanyByInn = async (innValue: string): Promise<DadataResponse> => {
        const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Token ${DADATA_TOKEN}`,
            },
            body: JSON.stringify({ query: innValue }),
        };

        const response = await fetch(url, options);
        return await response.json();
    };

    const fetchSelfEmployed = async (innValue: string) => {
        const url = `https://api-fns.ru/api/fl_status?inn=${innValue}&key=${FNS_KEY}`;
        const response = await fetch(url);
        return await response.json();
    };

    const handleInnChange = async (text: string) => {
        const cleanValue = text.replace(/[^0-9]/g, "");
        setInn(cleanValue);
        setInnError("");
        setName("");
        setIsSelfEmployed(false);
        setFio("");

        if (cleanValue.length === 10 || cleanValue.length === 12) {
            try {
                const data = await fetchCompanyByInn(cleanValue);
                if (data?.suggestions?.length > 0) {
                    const company = data.suggestions[0];
                    setName(company.value || company.unrestricted_value || "");
                    setInnError("");
                    setIsSelfEmployed(false);
                } else if (cleanValue.length === 12) {
                    // попробовать найти как самозанятый
                    const selfData = await fetchSelfEmployed(cleanValue);
                    if (selfData?.Самозанятость?.Статус === true) {
                        setIsSelfEmployed(true);
                        setInnError("Найден самозанятый");
                        setFio(selfData.ФИО || "");
                        setName(selfData.ФИО || "");
                    } else {
                        setInnError("Компания не найдена");
                        setName("");
                    }
                } else {
                    setInnError("Компания не найдена");
                }
            } catch (e) {
                console.error(e);
                setInnError("Ошибка запроса");
            }
        }
    };

    const handleFioChange = (text: string) => {
        if (!/^[a-zA-Zа-яА-ЯёЁ \-]*$/.test(text)) return;
        setFio(text);
        setName(text);
    };

    const addCompany = async () => {
        if (!inn) return Alert.alert("Ошибка", "Введите ИНН");
        if (!jwt) {
            // если нет токена — направим на логин
            router.push("/auth-modal");
            return;
        }

        setBusy(true);
        try {
            const response = await fetch("https://kodrf.ru/api/companies/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({ companyName: name, inn }),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => "");
                throw new Error(text || "Ошибка при добавлении компании");
            }

            Alert.alert("Успешно", "Компания добавлена!");
            // обновляем данные в контексте (person.companies)
            await refreshPersonAndCompanies(jwt);
            router.dismissAll();
        } catch (error) {
            console.error(error);
            Alert.alert("Ошибка", "Не удалось добавить компанию");
        } finally {
            setBusy(false);
        }
    };

    const deleteCompany = async (companyInn: string) => {
        if (!jwt) {
            router.push("/auth-modal");
            return;
        }

        setBusy(true);
        try {
            const response = await fetch(`https://kodrf.ru/api/companies/delete/${companyInn}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
            });

            if (!response.ok) {
                const text = await response.text().catch(() => "");
                throw new Error(text || "Ошибка при удалении компании");
            }

            Alert.alert("Успешно", "Компания удалена");
            await refreshPersonAndCompanies(jwt);
            router.dismissAll();
        } catch (error) {
            console.error(error);
            Alert.alert("Ошибка", "Не удалось удалить компанию");
        } finally {
            setBusy(false);
        }
    };

    // Если person отсутствует — предложим авторизоваться
    if (!person) {
        return (
            <View style={styles.center}>
                <Text style={styles.noCompanies}>Чтобы управлять компаниями, войдите в аккаунт</Text>
                <Pressable style={styles.button} onPress={() => router.push("/auth-modal")}>
                    <Text style={styles.buttonText}>Войти</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Добавленные компании:</Text>

            {Array.isArray(person?.companies) && person.companies.length ? (
                person.companies.map((c, i) => (
                    <View key={c.inn ?? i} style={styles.companyItem}>
                        <Text style={styles.companyText}>
                            {i + 1}. {c.companyName} ({c.inn})
                        </Text>
                        <Pressable onPress={() => deleteCompany(c.inn)} disabled={busy}>
                            <Text style={styles.deleteBtn}>Удалить</Text>
                        </Pressable>
                    </View>
                ))
            ) : (
                <Text style={styles.noCompanies}>Нет добавленных компаний</Text>
            )}

            <Text style={styles.title}>Добавить новую компанию:</Text>

            <TextInput
                style={styles.input}
                placeholder="ИНН"
                keyboardType="numeric"
                value={inn}
                onChangeText={handleInnChange}
            />
            {innError ? <Text style={styles.error}>{innError}</Text> : null}

            {isSelfEmployed && (
                <>
                    <TextInput style={styles.input} placeholder="ФИО" value={fio} onChangeText={handleFioChange} />
                    {fioError ? <Text style={styles.error}>{fioError}</Text> : null}
                </>
            )}

            {name && !isSelfEmployed ? <Text style={styles.companyName}>{name}</Text> : null}

            <Pressable style={[styles.button, busy && { opacity: 0.6 }]} onPress={addCompany} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Добавить</Text>}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    center: {
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontWeight: "700",
        fontSize: 18,
        marginBottom: 8,
        color: "#000",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    companyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingVertical: 8,
    },
    companyText: {
        color: "#000",
        fontSize: 16,
        width: "80%",
    },
    deleteBtn: {
        color: "red",
    },
    noCompanies: {
        color: "#888",
        marginBottom: 15,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#b752c9",
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    companyName: {
        textAlign: "center",
        fontSize: 16,
        color: "#000",
        marginVertical: 5,
    },
    error: {
        color: "red",
        fontSize: 14,
        marginBottom: 8,
    },
});
