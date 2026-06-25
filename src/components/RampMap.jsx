"use client";

import { useCallback, useRef } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { PH_CENTER, PH_DEFAULT_ZOOM, RATING_COLORS, RATING_VERDICTS } from "@/lib/constants";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Custom flat map style so it matches the paper/civic palette instead of
// default Google Maps blue-and-green.
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#EFEBE2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5C6B73" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FAF8F4" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#dcd6c8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d9dd" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

function markerIcon(rating) {
  const color = RATING_COLORS[rating];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="14" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="17" y="22" font-family="Georgia, serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">${rating}</text>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof window !== "undefined" ? new window.google.maps.Size(34, 34) : undefined,
  };
}

export default function RampMap({ ramps, onMapClick, selectedId, onSelect, isLoaded }) {
  const mapRef = useRef(null);
  const onLoad = useCallback((map) => { mapRef.current = map; }, []);

  const handleClick = useCallback(
    (e) => {
      onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    },
    [onMapClick]
  );

  const selected = ramps.find((r) => r.id === selectedId);

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <span>Loading map…</span>
      </div>
    );
  }

  return (
    <div className="map-canvas-wrap">
      <div className="click-hint">CLICK ANYWHERE TO REPORT A RAMP</div>

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={PH_CENTER}
        zoom={PH_DEFAULT_ZOOM}
        onLoad={onLoad}
        onClick={handleClick}
        options={{
          styles: MAP_STYLE,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        {ramps.map((r) => (
          <MarkerF
            key={r.id}
            position={{ lat: r.lat, lng: r.lng }}
            icon={markerIcon(r.rating)}
            onClick={() => onSelect(r.id)}
          />
        ))}
      </GoogleMap>

      {selected && (
        <div className="detail open">
          {selected.photoUrl && (
            <img src={selected.photoUrl} alt={selected.name} className="detail-photo" />
          )}
          <div className="detail-top">
            <div
              className="detail-score"
              style={{ color: RATING_VERDICTS[selected.rating].color }}
            >
              {selected.rating}
            </div>
            <div className="detail-meta">
              <div className="detail-name">{selected.name}</div>
              <div className="detail-addr">{selected.address || "Philippines"}</div>
              <span
                className="verdict"
                style={{
                  background: RATING_VERDICTS[selected.rating].bg,
                  color: RATING_VERDICTS[selected.rating].color,
                }}
              >
                {RATING_VERDICTS[selected.rating].label}
              </span>
            </div>
          </div>
          <div className="detail-note">{selected.note || "No additional notes."}</div>
          {selected.reporterId === "seed-data" && (
            <a href="/about" className="sourced-tag sourced-tag-detail">
              Sourced from public reporting — view methodology
            </a>
          )}
          <div className="detail-foot">
            <span className="detail-date">
              {selected.createdAt?.toDate
                ? selected.createdAt.toDate().toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : "Just now"}
            </span>
            <button className="btn-close-detail" onClick={() => onSelect(null)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
