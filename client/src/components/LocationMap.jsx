import { useEffect, useRef } from 'react';
import './LocationMap.css';

const LocationMap = ({ address, coordinates }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // If no coordinates provided but we have an address, try to geocode it
    if (!coordinates && address && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          initMap({
            lat: location.lat(),
            lng: location.lng()
          });
        }
      });
    } else if (coordinates && mapRef.current) {
      initMap(coordinates);
    }
  }, [address, coordinates]);

  const initMap = (coords) => {
    if (!coords || !mapRef.current) return;

    // If map doesn't exist, create it
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
    } else {
      // If map exists, just update the center
      mapInstanceRef.current.setCenter(coords);
    }

    // Add or update marker
    if (markerRef.current) {
      markerRef.current.setPosition(coords);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: coords,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP
      });
    }
  };

  return (
    <div className="location-map-container">
      <div className="map-display" ref={mapRef}></div>
      {address && <div className="map-address">{address}</div>}
    </div>
  );
};

export default LocationMap;