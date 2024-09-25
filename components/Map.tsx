import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL, { Images } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';
import iconChat from '../assets/icon-chat.png';
import locations from '../data/locations.json';

MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN || '');

const Map = () => {

    const locationsCollection = featureCollection(locations.map((location) => point([location.longitude, location.latitude])));

    return (
        <View style={styles.container}>
            <MapboxGL.MapView style={styles.map}>
                <MapboxGL.Camera followUserLocation followZoomLevel={16}></MapboxGL.Camera>
                <MapboxGL.LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }} />

                <MapboxGL.ShapeSource id="points" shape={locationsCollection}>
                    <MapboxGL.SymbolLayer id="point" style={{
                        iconImage: 'iconChat',
                        iconSize: 0.05,
                    }} />
                    <Images images={{ iconChat }} />
                </MapboxGL.ShapeSource>
            </MapboxGL.MapView>
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
