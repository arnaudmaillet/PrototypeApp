import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View, Text, KeyboardAvoidingView, Platform, Keyboard, Dimensions } from 'react-native';

import MapboxGL, { MapView, Images, SymbolLayer, CircleLayer, ShapeSource, Camera, LocationPuck, FillExtrusionLayer, PointAnnotation, ImageEntry } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

import Animated, {
    useSharedValue,
    withSpring,
    runOnJS,
    withTiming,
    useAnimatedStyle,
    SlideInDown,
    SlideOutDown,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";


import { usePoint } from '../providers/PointProvider';
import { PointContextType } from '../providers/PointContextType';
import pointsType from '../data/pointsType.json';

import { useSwipeGesture } from '../hooks/useSwipeGesture';

import { iconsMap } from '~/assets/assets';

import locations from '~/data/locations.json';
import videos from '~/data/videos.json';
import chats from '~/data/chats.json';

import ChatScreen from '~/screens/Chat';
import Photo from '~/screens/Photo';
import VideoScreen from '~/screens/Video';
import SearchMenu from './SearchMenu';


MapboxGL.setAccessToken('sk.eyJ1IjoibWFpbGxldGFyIiwiYSI6ImNtMTgxZ3l3bDB3MmsybnNjOTJ0cWozZWcifQ.dgWa21wpx6rWnfsnmjQMNQ');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Map = () => {

    const { selectedPoint, setSelectedPoint, coordinatesToMoveCamera, setCoordinatesToMoveCamera } = usePoint() as PointContextType;
    const cameraRef = React.useRef<MapboxGL.Camera>(null);

    const [isFollowingUser, setIsFollowingUser] = React.useState(true);
    const [positionSheetY, setPositionSheetY] = React.useState(0);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const offset = useSharedValue(0);


    // ** Get data from the JSON files ** //

    const getVideo = (id: number) => {
        return videos.data.find(video => video.id === id);
    }

    const getChat = (id: number) => {
        return chats.data.find(chat => chat.id === id);
    }


    // ** Point selection functions ** //

    // Get all points (flattened) for selecting random point
    const allPoints = locations.points;

    // Function to set selected point by index
    const setPointByIndex = (index: number) => {
        const point = allPoints[index];
        setSelectedPoint(point);
        setCoordinatesToMoveCamera([point.longitude, point.latitude]);
    };

    // Function to go to the next point
    const goToNextPoint = () => {
        if (!selectedPoint) {
            // If no point is selected, select the first one
            setPointByIndex(0);
        } else {
            const currentId = selectedPoint.id;
            const currentIndex = allPoints.findIndex(point => point.id === currentId);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= allPoints.length) {
                nextIndex = 0; // Loop to the start
            }
            setPointByIndex(nextIndex);
        }
    };

    // Function to go to the previous point
    const goToPreviousPoint = () => {
        if (!selectedPoint) {
            // If no point is selected, select the first one
            setPointByIndex(0);
        } else {
            const currentId = selectedPoint.id;
            const currentIndex = allPoints.findIndex(point => point.id === currentId);
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = allPoints.length - 1; // Loop to the end
            }
            setPointByIndex(prevIndex);
        }
    };


    const onPointPress = async (event: OnPressEvent) => {

        const feature = event.features[0];

        console.log('feature', feature);

        if (feature.properties) {
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates;

            //if (feature.properties.cluster === undefined) {
            setSelectedPoint(feature.properties);
            setCoordinatesToMoveCamera(coordinates as [number, number]);
            setIsFollowingUser(false);
            offset.value = 0
            //}
        }
    }


    // ** Gesture handlers ** //

    useSwipeGesture(goToNextPoint, goToPreviousPoint);

    const runOnJSSetSelectedPoint = (point: any) => {
        setSelectedPoint(point);
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX);
            if (isVerticalSwipe) {
                // Gérer le swipe haut/bas
                const offsetDelta = event.translationY // Calculer le déplacement + offset
                const clamp = Math.max(-20, offsetDelta); // Limiter le déplacement vers le haut
                offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp); // Appliquer le déplacement avec un rebond
                runOnJS(setPositionSheetY)(offsetDelta); // Mettre à jour la position de la feuille
            }
        })
        .onEnd((event) => {
            const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX);
            if (isVerticalSwipe) {
                if (offset.value < 520 / 3) {
                    offset.value = withSpring(0);
                    runOnJS(setPositionSheetY)(0);
                } else {
                    offset.value = withTiming(520, {}, () => {
                        runOnJS(runOnJSSetSelectedPoint)(null);
                    });
                }
            } else {
                runOnJS(dismissKeyboard)();
                if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                    if (event.translationX > 0) {
                        runOnJS(goToPreviousPoint)(); // Swipe Right: Go to previous point
                    } else {
                        runOnJS(goToNextPoint)(); // Swipe Left: Go to next point
                    }
                }
            }
        });

    // ** UseEffect ** //

    useEffect(() => {
        if (coordinatesToMoveCamera) {
            cameraRef.current?.setCamera({
                centerCoordinate: coordinatesToMoveCamera,
                animationDuration: 500,
                padding: {
                    paddingTop: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: selectedPoint === null ? 0 : Dimensions.get('window').height * 0.72,
                },
                pitch: selectedPoint === null ? 0 : 50,
            });
        }
        if (selectedPoint === null) {
            setSelectedPoint(null); // Vide `selectedPoint` lorsque la feuille est fermée
        }
    }, [selectedPoint, coordinatesToMoveCamera]);

    useEffect(() => {
        const handlePaddingAndPitchAnimation = () => {
            if (cameraRef.current) {
                const maxPosition = 520; // Position maximale de la feuille (par exemple, quand elle est complètement ouverte)
                const normalizedPosition = Math.min(Math.max(positionSheetY, 0), maxPosition);

                // Interpolation du pitch de 50 à 0 en fonction de la position de la feuille
                const newPitch = 50 - (50 * (normalizedPosition / maxPosition));

                // Interpolation du paddingBottom de max (height * 0.72) à 0
                const newPaddingBottom = Dimensions.get('window').height * 0.72 * (1 - (normalizedPosition / maxPosition));

                // Mise à jour de la caméra avec le nouveau pitch et padding
                cameraRef.current?.setCamera({
                    pitch: newPitch,
                    animationDuration: 500,
                    padding: {
                        paddingBottom: newPaddingBottom, // Appliquer le padding interpolé
                        paddingTop: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                    },
                });
            }
        };

        handlePaddingAndPitchAnimation();
    }, [positionSheetY]); // Recalculer à chaque mise à jour de positionSheetY


    const translateSheetY = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: offset.value }],
        };
    })

    // ** Render ** //

    return (
        <View style={styles.container}>
            {(() => {
                switch (selectedPoint?.type) {
                    case 1:
                        const chat = getChat(selectedPoint?.dataId);
                        return chat ? <>
                            <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    setSelectedPoint(null)
                                    dismissKeyboard()
                                }}
                            />
                            <GestureDetector gesture={panGesture}>
                                <Animated.View
                                    style={[styles.sheet, translateSheetY]}
                                >
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        keyboardVerticalOffset={160}
                                        style={styles.keyboardAvoidingView}
                                    >
                                        <ChatScreen chat={chat} currentUserId={1} />
                                    </KeyboardAvoidingView>
                                </Animated.View>
                            </GestureDetector>
                        </>
                            : <Text>No chat available</Text>;
                    case 2:
                        return <Photo />;
                    case 3:
                        const video = getVideo(selectedPoint?.dataId);
                        return video ?
                            <>
                                <AnimatedPressable
                                    style={styles.backdrop}
                                    onPress={() => {
                                        setSelectedPoint(null)
                                        dismissKeyboard()
                                    }}
                                />
                                <GestureDetector gesture={panGesture}>
                                    <Animated.View
                                        style={[styles.sheet, translateSheetY]}
                                    >
                                        <KeyboardAvoidingView
                                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                            keyboardVerticalOffset={160}
                                            style={styles.keyboardAvoidingView}
                                        >
                                            <VideoScreen video={video} />
                                        </KeyboardAvoidingView>
                                    </Animated.View>
                                </GestureDetector>
                            </>
                            : <Text>No video available</Text>;
                    default:
                        return (
                            <>
                                {
                                    isMenuOpen && (
                                        <AnimatedPressable
                                            style={styles.backdrop}
                                            onPress={() => {
                                                setIsMenuOpen(false)
                                                dismissKeyboard()
                                            }}
                                        />
                                    )
                                }
                                <Animated.View
                                    style={[styles.searchMenu, { height: isMenuOpen ? 500 : 150 }]}
                                    entering={SlideInDown.springify().damping(17)}
                                    exiting={SlideOutDown}
                                >
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        keyboardVerticalOffset={440}
                                        style={styles.keyboardAvoidingView}
                                    >
                                        <SearchMenu onBlurInput={() => setIsMenuOpen(false)} onFocusInput={() => setIsMenuOpen(true)} />
                                    </KeyboardAvoidingView>
                                </Animated.View>
                            </>
                        );
                }
            })()}
            <MapView
                style={styles.map}
                compassEnabled={selectedPoint === null}
                scaleBarEnabled={selectedPoint === null}
                styleURL="mapbox://styles/mapbox/light-v11"
                logoEnabled={false}
                attributionEnabled={false}
            >
                <Camera ref={cameraRef} followUserLocation={isFollowingUser} followZoomLevel={16} followPitch={0}></Camera>
                <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }} />

                <FillExtrusionLayer
                    id="3d-buildings"
                    minZoomLevel={15}
                    sourceLayerID='building'
                    style={{
                        fillExtrusionColor: '#aaa',
                        fillExtrusionHeight: ['get', 'height'],
                        fillExtrusionBase: ['get', 'min_height'],
                        fillExtrusionOpacity: 0.9,
                    }}
                    layerIndex={50} // 50 is max
                />

                {
                    pointsType.map((pointType) => {
                        const locationsPoints = featureCollection(locations.points.filter((_point) => _point.type === pointType.id).map((_point) => point([_point.longitude, _point.latitude, _point.type], _point)));
                        return (
                            <ShapeSource key={pointType.id.toString()} id={`points${pointType.name}`} cluster shape={locationsPoints} onPress={onPointPress}>
                                <SymbolLayer id={`cluster${pointType.name}-count`}
                                    filter={['has', 'point_count']}
                                    style={{
                                        textField: ['get', 'point_count_abbreviated'],
                                        textColor: 'gray',
                                        textSize: ['interpolate', ['linear'], ['get', 'point_count'], 2, 10, 5, 14, 10, 15, 15, 16, 20, 17],
                                    }} />
                                <CircleLayer id={`cluster${pointType.name}`}
                                    filter={['has', 'point_count']}
                                    style={{
                                        circlePitchAlignment: 'map',
                                        circleColor: pointType.color,
                                        circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 10, 5, 17, 10, 20, 15, 25, 20, 30],
                                        circleOpacity: 0.4,
                                    }} />

                                <SymbolLayer id={`point${pointType.name}`}
                                    filter={['!', ['has', 'point_count']]}
                                    style={{
                                        iconImage: [
                                            'case',
                                            // ['==', ['get', 'type'], 0] and selectedPoint?.id === ['get', 'id'], 'iconChatAnimated',
                                            ['==', ['get', 'type'], 1], 'iconChat',
                                            // ['==', ['get', 'type'], 2], 'iconPhoto',
                                            // ['==', ['get', 'type'], 3], 'iconVideo',
                                            // ['==', ['get', 'type'], 4], 'iconAudio',
                                            // ['==', ['get', 'type'], 5], 'iconLive',
                                            'none'
                                        ],
                                        // iconSize: [
                                        //     'case',
                                        //     selectedPoint?.id
                                        //         ? ['==', ['get', 'id'], selectedPoint.id]
                                        //         : false, // Si l'ID est indéfini, on n'applique pas la condition
                                        //     iconSize,
                                        //     0.04,
                                        // ],
                                        iconAnchor: 'center',
                                        iconSize: 0.04,
                                    }}
                                />
                                <Images images={{ ...iconsMap }} />
                            </ShapeSource>
                        )
                    })
                }
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    sheet: {
        position: "absolute",
        alignSelf: 'center',
        bottom: 20,
        zIndex: 1,
        width: 390,
        height: '80%',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1,
    },
    searchMenu: {
        position: "absolute",
        alignSelf: 'center',
        bottom: 20,
        zIndex: 2,
        width: 390,
    }
});

export default Map;
