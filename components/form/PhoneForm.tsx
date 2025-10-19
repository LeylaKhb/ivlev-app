import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

interface PhoneFormProps {
    setTelInputToParent: (value: string) => void;
    placeholder?: string;
    defaultValue?: string;
}

const PhoneForm: React.FC<PhoneFormProps> = ({
                                                 setTelInputToParent,
                                                 placeholder = "(999) 999-99-99",
                                                 defaultValue = "",
                                             }) => {
    const [value, setValue] = useState(defaultValue);

    const handleTelInput = (inputValue: string) => {
        // Удаляем все недопустимые символы, оставляем только цифры
        let digits = inputValue.replace(/[^0-9]/g, "");

        // Ограничиваем длину до 10 цифр (без +7)
        if (digits.length > 10) digits = digits.slice(0, 10);

        // Форматируем в (999) 999-99-99
        let formatted = "";
        if (digits.length > 0) formatted += "(" + digits.slice(0, 3);
        if (digits.length >= 4) formatted += ") " + digits.slice(3, 6);
        if (digits.length >= 7) formatted += "-" + digits.slice(6, 8);
        if (digits.length >= 9) formatted += "-" + digits.slice(8, 10);

        setValue(formatted);
        setTelInputToParent(formatted);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.prefix}>+7</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                keyboardType="phone-pad"
                value={value} // используем контролируемый компонент
                placeholderTextColor="#999"
                onChangeText={handleTelInput}
            />
        </View>
    );
};

export default PhoneForm;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    prefix: {
        marginRight: 4,
        fontSize: 16,
        position: "absolute",
        left: 10,
    },
    input: {
        width: "100%",
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        padding: 10,
        paddingLeft: 30,
        fontSize: 16,
    },
    inputError: {
        borderColor: "red",
    },
});
