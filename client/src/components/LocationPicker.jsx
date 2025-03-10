import { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

const LocationPicker = ({ initialValue = '', onLocationSelect }) => {
  const [location, setLocation] = useState(initialValue);
  const [coordinates, setCoordinates] = useState(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    if (!autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      minLength: 2 // Only show suggestions after at least 2 characters are typed
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const newLocation = place.formatted_address || place.name;
        setLocation(newLocation);
        setCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
        
        // Call the parent component's callback with the selected location data
        if (onLocationSelect) {
          onLocationSelect({
            address: newLocation,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
        }
      }
    });

    return () => {
      // Clean up listeners if needed
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [onLocationSelect]);



  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  return (
    <div className="location-picker-container">
      <div className="location-input-container">
        <input
          type="text"
          value={location}
          onChange={handleInputChange}
          ref={autocompleteRef}
          placeholder="Enter a location"
          className="location-input"
        />
      </div>
    </div>
  );
};

export default LocationPicker;