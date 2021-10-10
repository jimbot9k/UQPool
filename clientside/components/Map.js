import React, { useRef, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, {Marker} from 'react-native-maps';
//import { selectDestination, selectOrigin } from '../slices/sessionSlice';
import { useSelector } from 'react-redux';
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { setDestination , selectOrigin, selectDestination} from '../slices/sessionSlice'
import userSlice, { selectSocket , selectSID } from '../slices/userSlice'

const Map = () => {
    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const mapRef = useRef(null)

    useEffect(() => {
        if (!origin || !destination) return;

        // Zoom & Fit to markers
        mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        });
    }, [origin, destination])

    return (
        <MapView
            ref={mapRef}
            style={{
                display: 'flex',
                flex: 1,
            }}
            mapType="mutedStandard"
            initialRegion={{
                latitude: origin.location.lat,
                longitude: origin.location.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }}
        >
            {origin && destination && (
                <MapViewDirections
                    origin={origin.description}
                    destination={destination.description}
                    apikey={GOOGLE_MAPS_API_KEY}
                    lineDashPattern={[1]}
                    strokeWidth={3}
                    strokeColor="purple"
                />
            )}

            {origin?.location && (
                <Marker
                    coordinate={{
                        latitude: origin.location.lat,
                        longitude: origin.location.lng
                    }}
                    title="Origin"
                    description={origin.description}
                    identifier="origin"
                />
            )}

            {destination?.location && (
                    <Marker
                        coordinate={{
                            latitude: destination.location.lat,
                            longitude: destination.location.lng
                        }}
                        title="Destination"
                        description={destination.description}
                        identifier="destination"
                    />
                )}  
        </MapView>
    )
}

export default Map

const styles = StyleSheet.create({})
