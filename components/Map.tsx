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
} from "react-native-reanimated";


import { usePoint } from '../providers/PointProvider';
import { PointContextType } from '../providers/PointContextType';
import pointsType from '../data/pointsType.json';

import iconChat from '../assets/icon-chat.png';
import iconPhoto from '../assets/icon-photo.png';
import iconVideo from '../assets/icon-video.png';
import iconAudio from '../assets/icon-audio.png';
import iconLive from '../assets/icon-live.png';
import locations from '../data/locations.json';


MapboxGL.setAccessToken('sk.eyJ1IjoibWFpbGxldGFyIiwiYSI6ImNtMTgxZ3l3bDB3MmsybnNjOTJ0cWozZWcifQ.dgWa21wpx6rWnfsnmjQMNQ');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Map = () => {

    const { setSelectedPoint } = usePoint() as PointContextType;
    const cameraRef = React.useRef<MapboxGL.Camera>(null);

    const [isFollowingUser, setIsFollowingUser] = React.useState(true);
    const [coordinatesToMove, setCoordinatesToMove] = React.useState<[number, number] | null>(null);
    const [isOpen, setOpen] = React.useState(false);

    const offset = useSharedValue(0);

    const toggleSheet = () => {
        setOpen(!isOpen);
    }

    const onPointPress = async (event: OnPressEvent) => {
        const feature = event.features[0];

        console.log(feature);

        if (feature.properties) {
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates;


            if (feature.properties.cluster === undefined) {
                setSelectedPoint(feature.properties._point);
                setSelectedPoint(feature.properties._point);
                setCoordinatesToMove(coordinates as [number, number]);
                setIsFollowingUser(false);
                setOpen(true);
                offset.value = 0;
            }
        }
    }

    const pan = Gesture.Pan()
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
        if (coordinatesToMove) {
            cameraRef.current?.setCamera({
                centerCoordinate: coordinatesToMove,
                animationDuration: 500,
                padding: {
                    paddingTop: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: isOpen == false ? 0 : 600,
                },
                pitch: isOpen == false ? 0 : 50,
            });
        }
    }, [isOpen, coordinatesToMove]);

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
                        <GestureDetector gesture={pan}>
                            <Animated.View
                                style={[styles.sheet, translateY]}
                                entering={SlideInDown.springify().damping(15)}
                                exiting={SlideOutDown}
                            >
                                <Text>Test</Text>
                            </Animated.View>
                        </GestureDetector>
                    </>
                )
            }
            <MapView style={styles.map} compassEnabled styleURL="mapbox://styles/mapbox/light-v11">
                <Camera ref={cameraRef} followUserLocation={isFollowingUser} followZoomLevel={16} followPitch={0}></Camera>
                <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }} />

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
                                        iconSize: 0.04,
                                        iconAnchor: 'bottom-left',
                                    }} />
                                <Images images={{ iconChat, iconPhoto, iconVideo, iconAudio, iconLive }} />
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
        backgroundColor: "white",
        padding: 16,
        height: 700,
        width: "92%",
        position: "absolute",
        bottom: 20,
        borderRadius: 30,
        marginHorizontal: "4%",
        zIndex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        zIndex: 1,
    },
});

export default Map;
