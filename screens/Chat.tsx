import { View, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import Animated, { SlideInDown, SlideOutDown, StretchInY } from 'react-native-reanimated'

const Chat = () => {
    return (
        <View style={styles.container}>
            <Animated.View
                style={styles.messagesContainer}
                entering={StretchInY.springify().damping(17)}
                exiting={SlideOutDown}
            ></Animated.View>
            <Animated.View
                style={styles.inputContainer}
                entering={SlideInDown.springify().damping(17)}
                exiting={SlideOutDown}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                />
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    messagesContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 15,
    },
    gapContainer: {
        height: 25,
    },
    inputContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
    },
})


export default Chat