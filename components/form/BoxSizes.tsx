import React from "react";
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView } from "react-native";

interface BoxInput {
    id: string;
    length: number;
    width: number;
    height: number;
    amount: number;
}

type inputOptions = {
    [key: string]: number
}

interface BoxSizesProps {
    inputs: Array<inputOptions>;
    handleInputs: any;
}

const BoxSizes: React.FC<BoxSizesProps> = ({ inputs, handleInputs }) => {

    const handleChange = (value: string, index: number, field: keyof BoxInput) => {
        // Оставляем только числа
        let cleanValue = value.replace(/[^0-9]/g, "");
        if (cleanValue.length === 1 && cleanValue === "0") cleanValue = ""; // не разрешаем одиночный ноль

        const newInputs = inputs.map((input, i) => {
            if (i === index) {
                return { ...input, [field]: Number(cleanValue) };
            }
            return input;
        });

        handleInputs(newInputs);
    };

    const handlePlusClick = () => {
        const newInput: BoxInput = {
            id: Date.now().toString(),
            length: 0,
            width: 0,
            height: 0,
            amount: 0,
        };
        handleInputs([...inputs, newInput]);
    };

    const handleMinusClick = (index: number) => {
        if (inputs.length <= 1) return;
        handleInputs(inputs.filter((_, i) => i !== index));
    };

    return (
        <ScrollView horizontal style={styles.container}>
            <View style={{ flexDirection: "column", width: '100%' }}>
                <View style={styles.labelsRow}>
                    <Text style={styles.label}>Ширина</Text>
                    <Text style={styles.label}>Длина</Text>
                    <Text style={styles.label}>Высота</Text>
                    <Text style={styles.label}>Кол-во</Text>
                    <View style={{ width: 10 }} />
                </View>

                {inputs.map((input, index) => (
                    <View key={index} style={styles.row}>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0" placeholderTextColor="#999"
                            value={input.width === 0 ? "" : String(input.width)}
                            onChangeText={(val) => handleChange(val, index, "width")}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0" placeholderTextColor="#999"
                            value={input.length === 0 ? "" : String(input.length)}
                            onChangeText={(val) => handleChange(val, index, "length")}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0" placeholderTextColor="#999"
                            value={input.height === 0 ? "" : String(input.height)}
                            onChangeText={(val) => handleChange(val, index, "height")}
                        />
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0" placeholderTextColor="#999"
                            value={input.amount === 0 ? "" : String(input.amount)}
                            onChangeText={(val) => handleChange(val, index, "amount")}
                        />
                        {index !== 0 && (
                            <Pressable style={styles.minusBtn} onPress={() => handleMinusClick(index)}>
                                <Text style={styles.minusText}>-</Text>
                            </Pressable>
                        )}
                    </View>
                ))}

                <Pressable style={styles.plusBtn} onPress={handlePlusClick}>
                    <Text style={styles.plusText}>+</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default BoxSizes;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingTop: 20,
    },
    labelsRow: {
        flexDirection: "row",
        marginBottom: 8,
        alignItems: "center",
    },
    label: {
        width: 68,
        textAlign: "center",
        fontWeight: "600",
        fontSize: 14,
        marginHorizontal: 5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    input: {
        width: 68,
        height: 40,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        marginHorizontal: 5,
        textAlign: "center",
        fontSize: 16,
    },
    minusText: {
        color: "#000",
        fontSize: 25,
    },
    plusText: {
        color: "#000",
        fontSize: 18,
    },
    plusBtn: {
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 22,
        height: 44,
        width: 44,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: "auto", // в RN нельзя использовать auto, используем alignSelf
        alignSelf: "center",
        color: '#000'
    },
    minusBtn: {
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 17,
        height: 34,
        width: 34,
        alignItems: "center",
        justifyContent: "center",
        color: '#000'
    },
});
