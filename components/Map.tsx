import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN || '');

const Map = () => {
    return (
        <View style={styles.container}>
            <MapboxGL.MapView style={styles.map}>
                <MapboxGL.Camera followUserLocation followZoomLevel={16}></MapboxGL.Camera>
                <MapboxGL.LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }} />
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
