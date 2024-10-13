import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

const Photo = () => {
    return (
        <Animated.View style={styles.container} entering={SlideInDown.springify().damping(17)} exiting={SlideOutDown}>
            <Text>Photo</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2.5,
        borderRadius: 20,
    },
})

export default Photo