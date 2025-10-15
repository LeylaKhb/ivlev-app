import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';
import { ThemedText } from "@/components/themed-text";

interface SegmentedControlProps {
    options: string[];
    selectedIndex?: number;
    onChange?: (index: number) => void;
    activeColor?: string;
    inactiveColor?: string;
    style?: object;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
                                                                      options,
                                                                      selectedIndex = 0,
                                                                      onChange,
                                                                      activeColor = '#b752c9',
                                                                      inactiveColor = '#b752c9',
                                                                      style,
                                                                  }) => {
    const [currentIndex, setCurrentIndex] = useState(selectedIndex);
    const [containerWidth, setContainerWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handlePress = (index: number) => {
        setCurrentIndex(index);
        onChange && onChange(index);
    };

    useEffect(() => {
        if (containerWidth === 0) return;

        Animated.timing(slideAnim, {
            toValue: (containerWidth / options.length) * currentIndex,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [currentIndex, containerWidth]);

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    return (
        <View style={[styles.container, style]} onLayout={handleLayout}>
            <Animated.View
                style={[
                    styles.activeBackground,
                    {
                        width: containerWidth / options.length,
                        backgroundColor: activeColor,
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            />

            {options.map((option, index) => (
                <TouchableWithoutFeedback key={index} onPress={() => handlePress(index)}>
                    <View style={styles.option}>
                        <ThemedText
                            style={[
                                styles.label,
                                currentIndex === index && styles.labelActive,
                            ]}
                        >
                            {option}
                        </ThemedText>
                    </View>
                </TouchableWithoutFeedback>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#b752c9',
        borderRadius: 8,
        overflow: 'hidden',
        height: 50,
        position: 'relative',
    },
    option: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    activeBackground: {
        position: 'absolute',
        height: '100%',
        borderRadius: 8,
        top: 0,
        left: 0,
    },
    label: {
        fontWeight: '500',
        color: '#000',
    },
    labelActive: {
        color: '#fff',
    },
});
