import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL, { MapView, Images, SymbolLayer, CircleLayer, ShapeSource, Camera, LocationPuck } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';
import iconChat from '../assets/icon-chat.png';
import locations from '../data/locations.json';

MapboxGL.setAccessToken('sk.eyJ1IjoibWFpbGxldGFyIiwiYSI6ImNtMTgxZ3l3bDB3MmsybnNjOTJ0cWozZWcifQ.dgWa21wpx6rWnfsnmjQMNQ');

const Map = () => {

    const locationsCollection = featureCollection(locations.map((location) => point([location.longitude, location.latitude])));

    return (
        <View style={styles.container}>
            <MapView style={styles.map}>
                <Camera followUserLocation followZoomLevel={16}></Camera>
                <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }} />

                <ShapeSource id="points" cluster shape={locationsCollection}>
                    <SymbolLayer id="cluster-count"
                        filter={['has', 'point_count']}
                        style={{
                            textField: ['get', 'point_count_abbreviated'],
                            textColor: '#000',
                            textSize: 12,
                        }} />
                    <CircleLayer id="cluster"
                        filter={['has', 'point_count']}
                        style={{
                            circlePitchAlignment: 'map',
                            circleColor: '#2196f3',
                            circleRadius: ['interpolate', ['linear'], ['get', 'point_count'], 2, 15, 5, 17, 10, 20, 15, 25, 20, 30],
                            circleOpacity: 0.4,
                            circleStrokeColor: '#2196f3',
                            circleStrokeWidth: 1,
                        }} />
                    <SymbolLayer id="point"
                        filter={['!', ['has', 'point_count']]}
                        style={{
                            iconImage: 'iconChat',
                            iconSize: 0.05,
                            iconAnchor: 'bottom-left',
                        }} />
                    <Images images={{ iconChat }} />
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
});

export default Map;
