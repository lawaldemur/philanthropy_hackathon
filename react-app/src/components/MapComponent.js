import React, { useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 39.8283, // Center of the US
  lng: -98.5795,
};

const mapOptions = {
  styles: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#121212" }], // Dark background
    },
    {
      featureType: "all",
      elementType: "labels.text",
      stylers: [{ color: "#e0e0e0" }], // Light text
    },
    {
      featureType: "poi",
      elementType: "labels.text",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#333333" }],
    },
    {
      featureType: "road",
      elementType: "labels.text",
      stylers: [{ color: "#ffffff" }],
    },
  ],
};

function MyComponent(props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Use the environment variable
  });

  const [activeMarker, setActiveMarker] = useState(null);

  const locations = useMemo(() => [
    {
      id: 1,
      name: "Central Park",
      position: {
        lat: 40.785091,
        lng: -73.968285,
      },
    },
    {
      id: 2,
      name: "Golden Gate Bridge",
      position: {
        lat: 37.819929,
        lng: -122.478255,
      },
    },
    {
      id: 3,
      name: "Eiffel Tower",
      position: {
        lat: 48.858844,
        lng: 2.294351,
      },
    },
    {
      id: 4,
      name: "Sydney Opera House",
      position: {
        lat: -33.856784,
        lng: 151.215297,
      },
    },
    {
      id: 5,
      name: "Mount Everest",
      position: {
        lat: 27.988121,
        lng: 86.925026,
      },
    },
  ], []);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach(location => bounds.extend(location.position));
    map.fitBounds(bounds);
  }, [locations]);

  const onUnmount = useCallback(function callback(map) {
    // Clean up logic if needed
  }, []);

  const handleMapMarker = (id) => {
    setActiveMarker(id);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      <>
        {locations.map(({ id, name, position }) => (
          <MarkerF
            key={id}
            position={position}
            onClick={() => handleMapMarker(id)}
            
          >
            {activeMarker === id && (
              <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg">
                  <p>{name}</p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </>
    </GoogleMap>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      Loading...
    </div>
  );
}

export default React.memo(MyComponent);
