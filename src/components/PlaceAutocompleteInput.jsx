"use client";

import { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

// Wraps a plain text input with Google Places Autocomplete. When the
// user picks a suggestion, onPlaceSelected receives the place name,
// formatted address, and exact lat/lng so we skip a separate geocode call.
export default function PlaceAutocompleteInput({ value, onChange, onPlaceSelected, placeholder }) {
  const acRef = useRef(null);

  function handleLoad(autocomplete) {
    acRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: "ph" });
    autocomplete.setFields(["name", "formatted_address", "geometry"]);
  }

  function handlePlaceChanged() {
    const place = acRef.current?.getPlace();
    if (!place || !place.geometry) return;

    onPlaceSelected({
      name: place.name || "",
      address: place.formatted_address || "",
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  }

  return (
    <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
      <input
        className="finput"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Autocomplete>
  );
}
