import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native';

import MapboxGL, { MapView, Images, SymbolLayer, CircleLayer, ShapeSource, Camera, LocationPuck, FillExtrusionLayer } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    withTiming,
    SlideInDown,
    SlideOutDown,
    FadeIn,
    FadeOut,
    withRepeat,
} from "react-native-reanimated";


import { usePoint } from '../providers/PointProvider';
import { PointContextType } from '../providers/PointContextType';
import pointsType from '../data/pointsType.json';

import { useSwipeGesture } from '../hooks/useSwipeGesture';

import { getVideoSource, iconsMap } from '~/assets/assets';

import locations from '~/data/locations.json';

import Chat from '~/screens/Chat';
import Photo from '~/screens/Photo';
import VideoScreen from '~/screens/Video';


MapboxGL.setAccessToken('sk.eyJ1IjoibWFpbGxldGFyIiwiYSI6ImNtMTgxZ3l3bDB3MmsybnNjOTJ0cWozZWcifQ.dgWa21wpx6rWnfsnmjQMNQ');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Map = () => {

    const { selectedPoint, setSelectedPoint, coordinatesToMoveCamera, setCoordinatesToMoveCamera } = usePoint() as PointContextType;
    const cameraRef = React.useRef<MapboxGL.Camera>(null);

    const [isFollowingUser, setIsFollowingUser] = React.useState(true);
    const [currentIndex, setCurrentIndex] = React.useState<number>(0); // Keep track of the current index
    const [isOpen, setOpen] = React.useState(false);
    const [iconSize, setIconSize] = React.useState(0.04);

    const offset = useSharedValue(0);

    // Get all points (flattened) for selecting random point
    const allPoints = locations.points;

    const toggleSheet = () => {
        setOpen(!isOpen);
    }

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
            setCurrentIndex(0);
            setPointByIndex(0);
        } else {
            const currentId = selectedPoint.id;
            const currentIndex = allPoints.findIndex(point => point.id === currentId);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= allPoints.length) {
                nextIndex = 0; // Loop to the start
            }
            setCurrentIndex(nextIndex);
            setPointByIndex(nextIndex);
        }
    };

    // Function to go to the previous point
    const goToPreviousPoint = () => {
        if (!selectedPoint) {
            // If no point is selected, select the first one
            setCurrentIndex(0);
            setPointByIndex(0);
        } else {
            const currentId = selectedPoint.id;
            const currentIndex = allPoints.findIndex(point => point.id === currentId);
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = allPoints.length - 1; // Loop to the end
            }
            setCurrentIndex(prevIndex);
            setPointByIndex(prevIndex);
        }
    };

    useSwipeGesture(goToNextPoint, goToPreviousPoint);


    const onPointPress = async (event: OnPressEvent) => {

        const feature = event.features[0];

        if (feature.properties) {
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates;

            if (feature.properties.cluster === undefined) {
                setSelectedPoint(feature.properties);
                setCoordinatesToMoveCamera(coordinates as [number, number]);
                setIsFollowingUser(false);
                setOpen(true);
                offset.value = 0
            }
        }
    }


    // Swipe gesture to navigate between points
    const swipeLeftRight = Gesture.Pan()
        .onEnd((event) => {
            if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                if (event.translationX > 0) {
                    runOnJS(goToPreviousPoint)(); // Swipe Right: Go to previous point
                } else {
                    runOnJS(goToNextPoint)(); // Swipe Left: Go to next point
                }
            }
        });


    const swipeUpDown = Gesture.Pan()
        .onChange((event) => {
            const offsetDelta = event.changeY + offset.value;

            const clamp = Math.max(-20, offsetDelta);
            offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);
        })
        .onFinalize(() => {
            if (offset.value < 520 / 3) {
                offset.value = withSpring(0);
            } else {
                offset.value = withTiming(520, {}, () => {
                    runOnJS(toggleSheet)();
                });
            }
        });

    const translateY = useAnimatedStyle(() => ({
        transform: [{ translateY: offset.value }],
    }));



    useEffect(() => {
        if (coordinatesToMoveCamera) {
            cameraRef.current?.setCamera({
                centerCoordinate: coordinatesToMoveCamera,
                animationDuration: 500,
                padding: {
                    paddingTop: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: isOpen === false ? 0 : 600,
                },
                pitch: isOpen === false ? 0 : 50,
            });
        }
        if (!isOpen) {
            setSelectedPoint(null); // Vide `selectedPoint` lorsque la feuille est fermée
        }
    }, [isOpen, coordinatesToMoveCamera]);


    useEffect(() => {
        let bounceInterval: NodeJS.Timeout;

        if (selectedPoint) {
            // Démarre un intervalle pour changer la taille de l'icône
            bounceInterval = setInterval(() => {
                setIconSize((prev) => (prev === 0.04 ? 0.06 : 0.04));
            }, 300); // Changement de taille toutes les 300ms pour créer l'effet de rebond
        } else {
            setIconSize(0.04); // Réinitialise la taille lorsque le point n'est plus sélectionné
        }

        return () => {
            clearInterval(bounceInterval);
        };
    }, [selectedPoint]);



    return (
        <View style={styles.container}>
            {
                isOpen && (
                    <>
                        <AnimatedPressable
                            style={styles.backdrop}
                            onPress={toggleSheet}
                            entering={FadeIn}
                            exiting={FadeOut}
                        />
                        <GestureDetector gesture={Gesture.Race(swipeUpDown, swipeLeftRight)}>
                            <Animated.View
                                style={[styles.sheet, translateY]}
                                entering={SlideInDown.springify().damping(15)}
                                exiting={SlideOutDown}
                            >
                                {
                                    (() => {
                                        switch (selectedPoint?.type) {
                                            case 1:
                                                return <Chat />
                                            case 2:
                                                return <Photo />
                                            case 3:
                                                return <VideoScreen videoSource={getVideoSource(selectedPoint.file)} />
                                            default:
                                                return <Text>No content</Text>
                                        }
                                    })()
                                }
                            </Animated.View>
                        </GestureDetector>
                    </>
                )
            }
            <MapView style={styles.map} compassEnabled styleURL="mapbox://styles/mapbox/light-v11">
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
                                        textColor: '#000',
                                        textSize: 12,
                                    }} />
                                <CircleLayer id={`cluster${pointType.name}`}
                                    filter={['has', 'point_count']}
                                    style={{
                                        circlePitchAlignment: 'map',
                                        circleColor: pointType.color,
                                        circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                                        circleOpacity: 0.4,
                                        circleStrokeColor: pointType.color,
                                        circleStrokeWidth: 1,
                                    }} />
                                <SymbolLayer id={`point${pointType.name}`}
                                    filter={['!', ['has', 'point_count']]}
                                    style={{
                                        iconImage: [
                                            'case',
                                            ['==', ['get', 'type'], 1], 'iconChat',
                                            ['==', ['get', 'type'], 2], 'iconPhoto',
                                            ['==', ['get', 'type'], 3], 'iconVideo',
                                            ['==', ['get', 'type'], 4], 'iconAudio',
                                            ['==', ['get', 'type'], 5], 'iconLive',
                                            'none'
                                        ],
                                        iconSize: [
                                            'case',
                                            selectedPoint?.id
                                                ? ['==', ['get', 'id'], selectedPoint.id]
                                                : false, // Si l'ID est indéfini, on n'applique pas la condition
                                            iconSize,
                                            0.04,
                                        ],
                                        iconAnchor: 'center',
                                    }} />
                                <Images images={iconsMap} />
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
    sheet: {
        position: "absolute",
        alignSelf: 'center',
        bottom: 20,
        zIndex: 1
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1,
    },
});

export default Map;
