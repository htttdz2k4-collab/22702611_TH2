import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PRICE_MULTIPLIER } from '../constants/student';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface ProductCardProps {
    item: any;
    onPress: () => void;
}

export const ProductCard = React.memo(({ item, onPress }: ProductCardProps) => {
    const price = item.price ? item.price * PRICE_MULTIPLIER : 100000;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title || item.name}
                </Text>
                <Text style={styles.price}>{price.toLocaleString('vi-VN')} đ</Text>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginBottom: 12,
        marginHorizontal: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    image: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
    },
    info: {
        padding: 8,
    },
    title: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D97706',
    },
});