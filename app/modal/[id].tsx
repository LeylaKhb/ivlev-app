import React, {useEffect, useState} from "react";
import {
    View,
    ScrollView,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    Platform,
} from "react-native";
import {useLocalSearchParams, Stack} from "expo-router";
import {ThemedText} from "@/components/themed-text";
import {RadioButton} from "react-native-paper";
import CalendarPicker from 'react-native-calendar-picker';
import moment from "moment-timezone";
import {format} from "date-fns";
import {DepartureCity} from "@/models/DepartureCity";
import {DestinationWarehouse} from "@/models/DestinationWarehouse";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhoneForm from "@/components/form/PhoneForm";
import BoxSizes from "@/components/form/BoxSizes";
import {useTabEffect} from "@/hooks/use-tab-effect";
import {Orders} from "@/models/Orders";
import {Box} from "@/models/Box";


type inputOptions = {
    [key: string]: number
}

export default function ScheduleFormNative() {
    const {id, jsonSupply} = useLocalSearchParams<{ id: string; jsonSupply?: string }>();
    const supply = jsonSupply ? JSON.parse(jsonSupply) : null;
    const isRegularSupplies = supply.departureDate.toString() === "1970-01-01" || supply.departureDate.toString() === "1980-01-01" || supply.departureDate.toString() === "1990-01-01";

    const [tel, setTel] = useState("");
    const [inputs, setInputs] = useState<inputOptions[]>([{length: 0, width: 0, height: 0, amount: 0}]);
    const [supplyType, setSupplyType] = useState("Короб");
    const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
    const [selectedCity, setSelectedCity] = useState(supply.departureCities[0].cityName);
    const [willTaken, setWillTaken] = useState(false);
    const [payment, setPayment] = useState(false);
    const [ozonNumber, setOzonNumber] = useState("");
    const [departureDate, setDepartureDate] = useState<Date | null>(null);
    const [acceptanceDate, setAcceptanceDate] = useState<Date | null>(null);
    const [comment, setComment] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [jwt, setJwt] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('jwt').then(token => {
            setJwt(token)
        });

    }, []);

    const isWeekday = (date: Date) => {
        const day = date.getDay();

        const startDate = new Date("2024-12-27");
        const endDate = new Date("2025-01-06");
        if (date >= startDate && date <= endDate) {
            return false;
        }

        // исключаем ВС — 0, ПН — 1, ЧТ — 4
        return day !== 0 && day !== 1 && day !== 4;
    };

    const isWeekdayWithoutSunday = (date: Date) => {
        const day = date.getDay();

        const startDate = new Date("2024-12-27");
        const endDate = new Date("2025-01-06");
        if (date >= startDate && date <= endDate) {
            return false;
        }

        // исключаем только воскресенье
        return day !== 0;
    };

    const handleInputChange = (inputsValues: inputOptions[]) => {
        setInputs(inputsValues);
    };

    const checkPhone = () => {
        if (tel.replace(/\D/g, "").length < 10) {
            Alert.alert("Ошибка", "Номер введён некорректно");
            return false;
        }
        return true;
    };

    const checkOzon = (selectedWarehouse: DestinationWarehouse) => {
        if (selectedWarehouse.store === "Ozon" && ozonNumber.trim().length === 0) {
            Alert.alert("Ошибка", "Введите номер заказа Ozon");
            return false;
        }
        return true;
    };

    const checkComment = () => {
        if (willTaken && comment.trim().length === 0) {
            Alert.alert("Ошибка", "Укажите адрес забора товара");
            return false;
        }
        return true;
    };

    const checkDate = () => {
        if (isRegularSupplies && departureDate === null) {
            Alert.alert("Ошибка", "Пожалуйста, укажите дату отправки");
            return false;
        }
        return true;
    };

    const handleSubmit = async (isPayment: boolean) => {
        const selectedWarehouse = supply.warehouses[selectedStoreIndex];

        if (isSubmitting) return;
        setIsSubmitting(true);

        if (!checkPhone() || !checkOzon(selectedWarehouse) || !checkComment() || !checkDate()) {
            setIsSubmitting(false);
            return;
        }

        let volume = 0;
        for (const i of inputs) {
            const v = i.length * i.width * i.height * i.amount;
            if (v <= 0) {
                Alert.alert("Ошибка", "Размеры коробок заполнены некорректно");
                setIsSubmitting(false);
                return;
            }
            volume += v;
        }
        volume /= 1000000;

        try {
            const calcResp = await fetch("https://kodrf.ru/api/calculator", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + jwt,
                },
                body: JSON.stringify({
                    sendCity: selectedWarehouse.sendCity,
                    store: selectedWarehouse.store,
                    departureCity: selectedCity,
                    volume,
                    willTaken: willTaken,
                    pallet: supplyType === "Монопаллет",
                    amount: inputs.reduce((acc, i) => acc + Number(i.amount), 0),
                }),
            });

            const calcData = await calcResp.json();
            const [price, vol] = calcData.content.split("/");

            const phoneNumber = "8" + tel.replace(/\D/g, "").slice(-10);

            let departureDateSend = departureDate ?? supply.departureDate;
            let acceptanceDateSend = acceptanceDate ?? supply.acceptanceDate;

            let boxes: Box[] = [];
            inputs.map(input => {
                boxes.push(new Box(input["length"], input["width"], input["height"], input["amount"]));
            });

            let body = JSON.stringify({
                // TODO компанию добавить
                order: new Orders("", new Date(departureDateSend.getFullYear(), departureDateSend.getMonth(), departureDateSend.getDate() + 1),
                    new Date(acceptanceDateSend.getFullYear(), acceptanceDateSend.getMonth(), acceptanceDateSend.getDate() + 1),
                    phoneNumber, selectedWarehouse.sendCity, selectedCity, selectedWarehouse.store, supplyType, volume,
                    price, willTaken, payment, comment, ozonNumber, supply.title),
                boxes: boxes
            });

            console.log("📦 Отправка заявки:", body);

            const resp = await fetch("https://kodrf.ru/new_order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + jwt,
                },
                body: body,
            });

            const data = await resp.json();
            Alert.alert("Успешно", isPayment ? "Оплата откроется сейчас" : "Заявка сохранена!");
            console.log("✅ Ответ сервера:", data);
        } catch (err) {
            Alert.alert("Ошибка", "Не удалось отправить заявку");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{presentation: "modal", title: supply.title}}/>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedText style={styles.sectionTitle}>Телефон</ThemedText>
                <PhoneForm setTelInputToParent={setTel} defaultValue={tel}/>

                <ThemedText style={styles.sectionTitle}>Размеры коробок</ThemedText>
                <BoxSizes inputs={inputs} handleInputs={handleInputChange}/>

                {/* Тип поставки */}
                <ThemedText style={styles.sectionTitle}>Тип поставки</ThemedText>
                {["Короб", "Монопаллет", "Транзит"].map((t) => (
                    <Pressable key={t} style={styles.radioOption} onPress={() => setSupplyType(t)}>
                        <RadioButton.Android
                            value={t}
                            status={supplyType === t ? "checked" : "unchecked"}
                            onPress={() => setSupplyType(t)}
                        />
                        <ThemedText>{t}</ThemedText>
                    </Pressable>
                ))}

                {/* Склад */}
                <ThemedText style={styles.sectionTitle}>Склад</ThemedText>
                {supply.warehouses.map((w: DestinationWarehouse, idx: number) => (
                    <Pressable
                        key={idx}
                        style={styles.radioOption}
                        onPress={() => setSelectedStoreIndex(idx)}
                    >
                        <RadioButton.Android
                            value={idx.toString()}
                            status={selectedStoreIndex === idx ? "checked" : "unchecked"}
                            onPress={() => setSelectedStoreIndex(idx)}
                        />
                        <ThemedText>{w.warehouseName}</ThemedText>
                    </Pressable>
                ))}

                {/* Номер заказа Ozon */}
                {supply.warehouses[selectedStoreIndex].store === "Ozon" && (
                    <>
                        <ThemedText style={styles.sectionTitle}>Номер заказа (Ozon)</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите номер заказа"
                            value={ozonNumber}
                            onChangeText={setOzonNumber}
                        />
                    </>
                )}

                {/* Город отправки */}
                <ThemedText style={styles.sectionTitle}>Город отправки</ThemedText>
                {supply.departureCities.map((c: DepartureCity, idx: number) => (
                    <Pressable key={idx} style={styles.radioOption} onPress={() => setSelectedCity(c.cityName)}>
                        <RadioButton.Android
                            value={c.cityName}
                            status={selectedCity === c.cityName ? "checked" : "unchecked"}
                            onPress={() => setSelectedCity(c.cityName)}
                        />
                        <ThemedText>{c.cityName}</ThemedText>
                    </Pressable>
                ))}
                {isRegularSupplies && (
                    <>
                        <ThemedText style={styles.sectionTitle}>Дата отправки</ThemedText>
                        <Pressable
                            style={styles.dateBtn}
                            onPress={() => {
                                setShowDatePicker(!showDatePicker);
                            }}
                        >
                            <ThemedText>
                                {departureDate ? format(departureDate, "dd.MM.yyyy") : "Выберите дату"}
                            </ThemedText>
                        </Pressable>

                        {showDatePicker && (
                            <View style={styles.calendarContainer}>
                                <CalendarPicker
                                    selectedStartDate={departureDate ?? moment().add(1, 'day').toDate()}
                                    startFromMonday={true}
                                    allowRangeSelection={false}
                                    minDate={moment().add(1, 'day').toDate()}
                                    maxDate={moment().add(3, "months").toDate()}
                                    weekdays={["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]}
                                    months={["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
                                    ]}
                                    previousTitle="←"
                                    nextTitle="→"
                                    todayBackgroundColor="#f2e6ffs"
                                    selectedDayColor="#7300e6"
                                    selectedDayTextColor="#fff"
                                    textStyle={{
                                        color: "#000",
                                    }}
                                    disabledDates={(date: Date) => {
                                        if (supply.departureDate.toString() === "1970-01-01") {
                                            return !isWeekday(date);
                                        } else {
                                            return !isWeekdayWithoutSunday(date);
                                        }
                                    }}
                                    onDateChange={(date: Date) => {
                                        setDepartureDate(date);
                                        setShowDatePicker(false);
                                    }}
                                />
                            </View>
                        )}
                    </>
                )}

                {/* Забрать со склада */}
                <ThemedText style={styles.sectionTitle}>Забрать со склада</ThemedText>
                {["Да", "Нет"].map((o) => (
                    <Pressable key={o} style={styles.radioOption} onPress={() => setWillTaken(o === "Да")}>
                        <RadioButton.Android
                            value={o}
                            status={o === (willTaken ? "Да" : "Нет") ? "checked" : "unchecked"}
                            onPress={() => setWillTaken(o === "Да")}
                        />
                        <ThemedText>{o}</ThemedText>
                    </Pressable>
                ))}

                {/* Способ оплаты */}
                <ThemedText style={styles.sectionTitle}>Способ оплаты</ThemedText>
                {["Онлайн на сайте", "В офисе"].map((o) => (
                    <Pressable key={o} style={styles.radioOption} onPress={() => setPayment(o === "Онлайн на сайте")}>
                        <RadioButton.Android
                            value={o}
                            status={o === (payment ? "Онлайн на сайте" : "В офисе") ? "checked" : "unchecked"}
                            onPress={() => setPayment(o === "Онлайн на сайте")}
                        />
                        <ThemedText>{o}</ThemedText>
                    </Pressable>
                ))}

                {/* Комментарий */}
                <ThemedText style={styles.sectionTitle}>Доп. комментарий</ThemedText>
                <TextInput
                    style={styles.textArea}
                    placeholder="Укажите, откуда забрать товар или напишите иные комментарии"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                />

                {/*TODO кнопки согласия с правилами*/}
                {/* Кнопки */}
                <Pressable style={styles.button} onPress={() => handleSubmit(false)} disabled={isSubmitting}>
                    <ThemedText style={styles.buttonText}>Сохранить заявку</ThemedText>
                </Pressable>

                {payment && (
                    <Pressable style={styles.buttonAlt} onPress={() => handleSubmit(true)} disabled={isSubmitting}>
                        <ThemedText style={styles.buttonText}>Оплатить сразу</ThemedText>
                    </Pressable>
                )}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 60,
        backgroundColor: "#fff",
    },
    sectionTitle: {
        marginTop: 20,
        fontWeight: "600",
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
    },
    error: {
        color: "red",
        fontSize: 13,
        marginTop: 4,
    },
    radioOption: {
        flexDirection: "row",
        alignItems: "center",
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        marginTop: 10,
    },
    boxRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 6,
    },
    boxInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        padding: 6,
        marginHorizontal: 3,
    },
    addBtn: {
        color: "#007AFF",
        marginTop: 10,
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#000000",
        borderRadius: 8,
        marginTop: 30,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonAlt: {
        backgroundColor: "#000000",
        borderRadius: 8,
        marginTop: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    dateBtn: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    calendarContainer: {
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    calendarPicker: {
        width: "100%", // календарь растянется на всю ширину контейнера
        alignSelf: "center",
    },

});
