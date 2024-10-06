import { ActivityIndicator, StyleSheet, TouchableWithoutFeedback, View, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface VideoScreenProps {
    videoSource: { uri: string };
}

const VideoScreen: React.FC<VideoScreenProps> = ({ videoSource }) => {
    const [isLoaded, setIsLoaded] = useState(false); // Pour suivre l'état de chargement
    const [shouldAnimate, setShouldAnimate] = useState<boolean>(false); // Pour surveiller les changements de source vidéo
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const progress = useSharedValue(0); // Progression de la vidéo partagée
    const videoRef = useRef<Video | null>(null); // Référence à la vidéo

    // Gestion du chargement de la vidéo pour des transitions plus fluides
    useEffect(() => {
        const loadVideo = async () => {
            if (videoRef.current) {
                try {
                    setIsLoaded(false); // Réinitialiser l'état de chargement
                    setShouldAnimate(true); // Activer l'animation lors du changement de source
                    await videoRef.current.unloadAsync(); // Décharger toute vidéo précédente
                    await videoRef.current.loadAsync(videoSource, {}, false); // Charger la nouvelle vidéo
                    await videoRef.current.playAsync(); // Jouer la vidéo après le chargement
                    setIsLoaded(true); // La vidéo est prête et en lecture
                    progress.value = withTiming(0, { duration: 0 }); // Réinitialiser la progression
                } catch (error) {
                    console.error("Error loading video:", error);
                }
            }
        };

        loadVideo();
    }, [videoSource]); // Recharger la vidéo si la source change

    useEffect(() => {
        if (isLoaded) {
            setTimeout(() => setShouldAnimate(false), 300); // Désactiver l'animation après 300ms
        }
    }, [isLoaded]);

    const animatedProgressBarStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));


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
    }


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
                        source={videoSource}
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

                <View style={styles.progressBarContainer}>
                    <Animated.View style={[styles.progressBar, animatedProgressBarStyle]} />
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
        bottom: 0, // Positionne la barre en bas de l'écran
        left: 0,
        right: 0,
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'grey',
        borderRadius: 5,
    },
});

export default VideoScreen;
