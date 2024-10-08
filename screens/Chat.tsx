import { View, StyleSheet, TextInput, FlatList, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withDelay } from 'react-native-reanimated'
import pointerColors from '~/constants/pointerColors'
import users from '~/data/users'

interface MessageProps {
    userId: number,
    content: string,
    date: string
}

interface ChatProps {
    id: number,
    messages: MessageProps[]
    usersId: number[]
}

interface ChatScreenProps {
    chat: ChatProps,
    currentUserId: number
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chat, currentUserId }) => {
    const screenWidth = Dimensions.get('window').width
    const [textWidth, setTextWidth] = useState(0) // Stocke la largeur du texte

    const scrollX = useSharedValue(0)

    useEffect(() => {
        // Calculez la largeur du texte pour le repositionner une fois qu'il est complètement défilé
        scrollX.value = withRepeat(
            withTiming(-textWidth, { duration: 20000 }), // Défilement sur une durée définie
            -1, // Répétition infinie
            false // Pas d'inversion
        )
    }, [textWidth])

    // Appliquer la position à l'élément textuel du message
    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: scrollX.value }]
        }
    })

    const renderMessage = ({ item }: { item: MessageProps }) => {
        const isCurrentUser = item.userId === currentUserId
        return (
            <View style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.messageDate}>{item.date}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={styles.messagesContainer}
            >
                {/* Header Bandeau */}
                <View style={styles.headerContainer}>
                    <View style={styles.userContainer}>
                        <View style={styles.userIcon}>
                            <Text style={styles.userIconText}>{users.data.find((user: { id: number; username: string }) => user.id === chat.usersId[0])?.username}</Text>
                        </View>
                        <Text style={styles.userName}>User {chat.usersId[0]}</Text>
                    </View>
                    <View style={styles.firstMessageContainer}>
                        {/* Capturez la largeur du texte pour les animations */}
                        <Animated.Text
                            style={[styles.firstMessageContent, animatedTextStyle]}
                            onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)} // Capturer la largeur du texte
                        >
                            {chat.messages[0].content}
                        </Animated.Text>
                    </View>
                </View>

                <FlatList
                    data={chat.messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => index.toString()}
                    inverted
                    contentContainerStyle={styles.messagesList}
                />
            </Animated.View>
            <Animated.View
                style={styles.inputContainer}
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },
    messagesContainer: {
        flex: 4,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 1,
    },
    messagesList: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        overflow: 'hidden', // Assurez-vous que le texte défilant reste dans la limite du conteneur
    },
    userContainer: {
        display: 'flex',
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    userIconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        flex: 1,
    },
    firstMessageContainer: {
        flex: 6,
        overflow: 'hidden',
    },
    firstMessageContent: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'right',
    },
    messageBubble: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    currentUserBubble: {
        alignSelf: 'flex-end',
        backgroundColor: pointerColors.chat
    },
    otherUserBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',

    },
    messageText: {
        color: 'black',
    },
    messageDate: {
        fontSize: 10,
        color: 'gray',
        alignSelf: 'flex-end',
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
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 1,
    },
})

export default ChatScreen
