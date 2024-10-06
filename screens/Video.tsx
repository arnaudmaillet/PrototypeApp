import { ActivityIndicator, StyleSheet, TouchableWithoutFeedback, View, Image, Text } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, { Easing, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';

import { getVideoSource } from '~/assets/assets';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';

interface VideoProps {
    id: number,
    file: string,
    account: string,
    likes: number,
    comments: number,
    shares: number,
    views: number,
    bookmark: number,
    description: string
}

interface VideoScreenProps {
    video: VideoProps
}

const VideoScreen: React.FC<VideoScreenProps> = ({ video }) => {
    const [isLoaded, setIsLoaded] = useState(false); // Pour suivre l'état de chargement
    const [shouldAnimate, setShouldAnimate] = useState<boolean>(false); // Pour surveiller les changements de source vidéo
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const progress = useSharedValue(0); // Progression de la vidéo partagée
    const videoRef = useRef<Video | null>(null); // Référence à la vidéo

    const bounceValue = useSharedValue(0);

    useEffect(() => {
        const loadVideo = async () => {
            if (videoRef.current) {
                try {
                    setIsLoaded(false); // Réinitialiser l'état de chargement
                    setShouldAnimate(true); // Activer l'animation lors du changement de source
                    await videoRef.current.unloadAsync(); // Décharger toute vidéo précédente
                    await videoRef.current.loadAsync(getVideoSource(video.file), {}, false); // Charger la nouvelle vidéo
                    await videoRef.current.playAsync(); // Jouer la vidéo après le chargement
                    setIsLoaded(true); // La vidéo est prête et en lecture
                    progress.value = withTiming(0, { duration: 0 }); // Réinitialiser la progression
                } catch (error) {
                    console.error("Error loading video:", error);
                }
            }
        };

        loadVideo();
    }, [video]); // Recharger la vidéo si la source change

    useEffect(() => {
        if (isLoaded) {
            setTimeout(() => setShouldAnimate(false), 300); // Désactiver l'animation après 300ms
        }
    }, [isLoaded]);

    useEffect(() => {
        bounceValue.value = withRepeat(
            withTiming(-5, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1, // Répéter indéfiniment
            true // Inverser à chaque itération pour l'effet de retour
        );
    }, []);

    const animatedProgressBarStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const animatedArrowStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: bounceValue.value, // Appliquer la translation à l'icône
                },
            ],
        };
    })

    const handleVideoPress = async () => {
        console.log('Video pressed');
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying); // Inverser l'état de lecture
        }
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.durationMillis && status.positionMillis) {
            const progressValue = status.positionMillis / status.durationMillis;
            progress.value = withTiming(progressValue, { duration: 500 }); // Animation fluide avec timing
        }
    };

    return (
        <Animated.View
            style={styles.container}
            entering={shouldAnimate ? FadeIn.duration(1000) : undefined} // Animation de transition d'entrée
            exiting={shouldAnimate ? FadeOut.duration(1000) : undefined}  // Animation de transition de sortie
        >
            <View style={styles.loaderContainer}>
                {!isLoaded && (
                    <ActivityIndicator size="large" color="gray" style={styles.loader} />
                )}
                <TouchableWithoutFeedback onPress={handleVideoPress}>
                    <Video
                        ref={videoRef}
                        source={getVideoSource(video.file)}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={isLoaded} // Jouer seulement lorsque la vidéo est prête
                        isLooping
                        style={styles.video}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />
                </TouchableWithoutFeedback>

                {/* ProgressBar */}
                <View style={styles.progressBarContainer}>
                    <Animated.View style={[styles.progressBar, animatedProgressBarStyle]} />
                </View>

                {/* Informations du compte en haut de l'écran */}
                <View style={styles.accountInfoContainer}>
                    <Text style={styles.accountText}>@{video.account}</Text>
                    <Text style={styles.descriptionText}>{video.description}</Text>
                </View>


                {/* Icône avec l'animation de rebond */}
                <Animated.View style={[styles.arrowContainer, animatedArrowStyle]}>
                    <MaterialIcons name="keyboard-arrow-up" size={30} color="white" />
                </Animated.View>


                {/* Informations sociales : likes, commentaires, partages */}
                <View style={styles.socialInfoContainer}>
                    <View style={styles.socialItem}>
                        <FontAwesome6 name="eye" size={20} color="white" />
                        <Text style={styles.socialText}>{video.views}</Text>
                    </View>
                    <View style={styles.socialItem}>
                        <FontAwesome6 name="heart" size={20} color="white" />
                        <Text style={styles.socialText}>{video.likes}</Text>
                    </View>
                    <View style={styles.socialItem}>
                        <FontAwesome6 name="bookmark" size={19} color="white" />
                        <Text style={styles.socialText}>{video.bookmark}</Text>
                    </View>
                    <View style={styles.socialItem}>
                        <FontAwesome6 name="share" size={20} color="white" />
                        <Text style={styles.socialText}>{video.shares}</Text>
                    </View>
                    <View style={styles.socialItem}>
                        <FontAwesome6 name="comment" size={20} color="white" />
                        <Text style={styles.socialText}>{video.comments}</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(0, 0, 0, 0.9)',
        borderWidth: 2.5,
        borderRadius: 20,
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    video: {
        width: 390,
        height: 700,
        backgroundColor: 'none',
    },
    loader: {
        position: 'absolute',
        zIndex: 1,
    },
    progressBarContainer: {
        width: '100%',
        height: 5,
        backgroundColor: '#ccc',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'grey',
        borderRadius: 5,
    },
    accountInfoContainer: {
        position: 'absolute',
        top: 30,
        left: 20,
        right: 20,
        alignItems: 'flex-start',
    },
    accountText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    descriptionText: {
        color: 'white',
        fontSize: 14,
    },
    arrowContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialInfoContainer: {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 10,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    socialItem: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
    },
    socialText: {
        width: 30,
        textAlign: 'center',
        color: 'white',
        fontSize: 12,
        marginLeft: 2,
    },
});

export default VideoScreen;
