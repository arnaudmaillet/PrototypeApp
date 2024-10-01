import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native';

import MapboxGL, { MapView, Images, SymbolLayer, CircleLayer, ShapeSource, Camera, LocationPuck, FillExtrusionLayer } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

import { usePoint } from '../providers/PointProvider';
import { PointContextType } from '../providers/PointContextType';

import iconChat from '../assets/icon-chat.png';
import iconPhoto from '../assets/icon-photo.png';
import iconVideo from '../assets/icon-video.png';
import iconMusic from '../assets/icon-music.png';
import iconLive from '../assets/icon-live.png';
import locations from '../data/locations.json';


MapboxGL.setAccessToken('sk.eyJ1IjoibWFpbGxldGFyIiwiYSI6ImNtMTgxZ3l3bDB3MmsybnNjOTJ0cWozZWcifQ.dgWa21wpx6rWnfsnmjQMNQ');

const Map = () => {

    const { setSelectedPoint } = usePoint() as PointContextType;

    const locationsChats = featureCollection(locations.chats.map((chat) => point([chat.longitude, chat.latitude], { chat })));
    const locationsPhotos = featureCollection(locations.photos.map((photo) => point([photo.longitude, photo.latitude], { photo })));
    const locationsVideos = featureCollection(locations.videos.map((video) => point([video.longitude, video.latitude], { video })));
    const locationsMusics = featureCollection(locations.musics.map((music) => point([music.longitude, music.latitude], { music })));
    const locationLives = featureCollection(locations.lives.map((live) => point([live.longitude, live.latitude], { live })));

    const [isOpen, setOpen] = React.useState(true);

    const toggleSheet = () => {
        setOpen(!isOpen);
    }

    const onPointPress = async (event: OnPressEvent) => {
        if (event.features[0].properties && event.features[0].properties.chat) {
            setSelectedPoint(event.features[0].properties.chat);
        }

        if (event.features[0].properties && event.features[0].properties.photo) {
            setSelectedPoint(event.features[0].properties.photo);
        }

        if (event.features[0].properties && event.features[0].properties.video) {
            setSelectedPoint(event.features[0].properties.video);
        }

        if (event.features[0].properties && event.features[0].properties.music) {
            setSelectedPoint(event.features[0].properties.music);
        }

        if (event.features[0].properties && event.features[0].properties.live) {
            setSelectedPoint(event.features[0].properties.live);
        }
    }

    return (
        <View style={styles.container}>
            {
                isOpen && (
                    <>
                        <Pressable style={styles.backdrop} onPress={toggleSheet}>
                            <View style={styles.sheet}>
                                <Text>Test</Text>
                            </View>
                        </Pressable>
                    </>
                )
            }
            <MapView style={styles.map} compassEnabled styleURL="mapbox://styles/mapbox/light-v11">
                <Camera followUserLocation followZoomLevel={16} followPitch={0}></Camera>
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

                <ShapeSource id="pointsChats" cluster shape={locationsChats} onPress={onPointPress}>
                    <SymbolLayer id="clusterChats-count"
                        filter={['has', 'point_count']}
                        style={{
                            textField: ['get', 'point_count_abbreviated'],
                            textColor: '#000',
                            textSize: 12,
                        }} />
                    <CircleLayer id="clusterChats"
                        filter={['has', 'point_count']}
                        style={{
                            circlePitchAlignment: 'map',
                            circleColor: '#ffc107',
                            circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                            circleOpacity: 0.4,
                            circleStrokeColor: '#ffc107',
                            circleStrokeWidth: 1,
                        }} />
                    <SymbolLayer id="pointChat"
                        filter={['!', ['has', 'point_count']]}
                        style={{
                            iconImage: 'iconChat',
                            iconSize: 0.04,
                            iconAnchor: 'bottom-left',
                        }} />
                    <Images images={{ iconChat }} />
                </ShapeSource>

                <ShapeSource id="pointsPhotos" cluster shape={locationsPhotos} onPress={onPointPress}>
                    <SymbolLayer id="clusterPhotos-count"
                        filter={['has', 'point_count']}
                        style={{
                            textField: ['get', 'point_count_abbreviated'],
                            textColor: '#000',
                            textSize: 12,
                        }} />
                    <CircleLayer id="clusterPhotos"
                        filter={['has', 'point_count']}
                        style={{
                            circlePitchAlignment: 'map',
                            circleColor: '#f44336',
                            circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                            circleOpacity: 0.4,
                            circleStrokeColor: '#f44336',
                            circleStrokeWidth: 1,
                        }} />
                    <SymbolLayer id="pointPhoto"
                        filter={['!', ['has', 'point_count']]}
                        style={{
                            iconImage: 'iconPhoto',
                            iconSize: 0.04,
                            iconAnchor: 'bottom-left',
                            iconOpacity: 0.8,
                        }} />
                    <Images images={{ iconPhoto }} />
                </ShapeSource>

                <ShapeSource id="pointsVideos" cluster shape={locationsVideos} onPress={onPointPress}>
                    <SymbolLayer id="clusterVideos-count"
                        filter={['has', 'point_count']}
                        style={{
                            textField: ['get', 'point_count_abbreviated'],
                            textColor: '#000',
                            textSize: 12,
                        }} />
                    <CircleLayer id="clusterVideos"
                        filter={['has', 'point_count']}
                        style={{
                            circlePitchAlignment: 'map',
                            circleColor: '#2196f3',
                            circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                            circleOpacity: 0.4,
                            circleStrokeColor: '#2196f3',
                            circleStrokeWidth: 1,
                        }} />
                    <SymbolLayer id="pointVideo"
                        filter={['!', ['has', 'point_count']]}
                        style={{
                            iconImage: 'iconVideo',
                            iconSize: 0.04,
                            iconAnchor: 'bottom-left',
                            iconOpacity: 0.8,
                        }} />
                    <Images images={{ iconVideo }} />
                </ShapeSource>

                <ShapeSource id="pointsMusics" cluster shape={locationsMusics} onPress={onPointPress}>
                    <SymbolLayer id="clusterMusics-count"
                        filter={['has', 'point_count']}
                        style={{
                            textField: ['get', 'point_count_abbreviated'],
                            textColor: '#000',
                            textSize: 12,
                        }} />
                    <CircleLayer id="clusterMusics"
                        filter={['has', 'point_count']}
                        style={{
                            circlePitchAlignment: 'map',
                            circleColor: '#8D939C',
                            circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                            circleOpacity: 0.4,
                            circleStrokeColor: '#8D939C',
                            circleStrokeWidth: 1,
                        }} />
                    <SymbolLayer id="pointMusic"
                        filter={['!', ['has', 'point_count']]}
                        style={{
                            iconImage: 'iconMusic',
                            iconSize: 0.04,
                            iconAnchor: 'bottom-left',
                            iconOpacity: 0.8,
                        }} />
                    <Images images={{ iconMusic }} />
                </ShapeSource>

                <ShapeSource id="pointsLives" cluster shape={locationLives} onPress={onPointPress}>
                    <SymbolLayer id="clusterLives-count"
                        filter={['has', 'point_count']}
                        style={{
                            textField: ['get', 'point_count_abbreviated'],
                            textColor: '#000',
                            textSize: 12,
                        }} />
                    <CircleLayer id="clusterLives"
                        filter={['has', 'point_count']}
                        style={{
                            circlePitchAlignment: 'map',
                            circleColor: '#662d91',
                            circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                            circleOpacity: 0.4,
                            circleStrokeColor: '#662d91',
                            circleStrokeWidth: 1,
                        }} />
                    <Images images={{ iconLive }} />
                </ShapeSource>
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
        height: 220,
        width: "100%",
        position: "absolute",
        bottom: -20 * 1.1,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        zIndex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
});

export default Map;
