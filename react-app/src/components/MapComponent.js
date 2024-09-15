import React, { useState } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "1000px",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

function MyComponent(props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyB4IFe1uxmeVr2XIH_mGUT6wezkmAEbZwQ",
  });
  // eslint-disable-next-line
  const [map, setMap] = React.useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);

    setMap(map);
    map.fitBounds(bounds);
  }, []);

  const locations = [
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
  ];

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  // eslint-disable-next-line
  const handleMapMarker = (location) => {
    if (selectedLocation === location) {
      return;
    }
    setSelectedLocation(location);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={locations[0].position}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <>
        {locations.map(({ id, name, position }) => (
          <MarkerF
            key={id}
            position={position}
            onClick={() => handleMapMarker(id)}
            icon={{
              url: "https://anysoldier.mbtechconsultants.com/wp-content/uploads/2022/05/icon-donates-06.png",
              scaledSize: { width: 50, height: 50 },
            }}
          >
            {console.log(position)}
            {activeMarker === id ? (
              <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                <div>
                  <p>{name}</p>
                </div>
              </InfoWindowF>
            ) : null}
          </MarkerF>
        ))}
      </>
    </GoogleMap>
  ) : (
    <>
      <h1>Loading...</h1>
    </>
  );
}

export default React.memo(MyComponent);
