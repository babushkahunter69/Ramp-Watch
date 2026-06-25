"use client";

import { useEffect, useState, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { ensureAnonAuth } from "@/lib/firebase";
import { fetchRamps, submitRamp } from "@/lib/ramps";
import { geocodeAddress } from "@/lib/geocode";
import { uploadRampPhoto } from "@/lib/upload";
import Sidebar from "@/components/Sidebar";
import RampMap from "@/components/RampMap";
import ReportModal from "@/components/ReportModal";
import OnboardingOverlay from "@/components/OnboardingOverlay";

const LIBRARIES = ["places"];

export default function Home() {
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [uid, setUid] = useState(null);
  const [ramps, setRamps] = useState([]);
  const [filter, setFilter] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileView, setMobileView] = useState("map");

  useEffect(() => {
    ensureAnonAuth().then(setUid).catch(console.error);
  }, []);

  const loadRamps = useCallback(async () => {
    try {
      const data = await fetchRamps();
      setRamps(data);
    } catch (e) {
      console.error("Failed to load ramps", e);
    }
  }, []);

  useEffect(() => {
    loadRamps();
  }, [loadRamps]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function handleMapClick(coords) {
    setPendingCoords(coords);
    setModalOpen(true);
  }

  function handleOpenModalFromHeader() {
    setPendingCoords(null);
    setModalOpen(true);
  }

  async function handleSubmit({ name, address, note, rating, placeCoords, photoFile }) {
    if (!uid) throw new Error("Still signing you in, please try again in a moment.");

    // Precision priority: an exact place pick beats a map click,
    // which beats falling back to geocoding a typed address.
    let coords = placeCoords || pendingCoords;

    if (!coords && address?.trim()) {
      const geo = await geocodeAddress(address);
      if (geo) coords = { lat: geo.lat, lng: geo.lng };
    }

    if (!coords) {
      throw new Error("Pick a suggested place, click the map, or enter a recognizable address.");
    }

    let photoUrl = "";
    if (photoFile) {
      try {
        photoUrl = await uploadRampPhoto(photoFile, uid);
      } catch (e) {
        console.error("Photo upload failed", e);
        throw new Error("Photo upload failed. You can try again or submit without a photo.");
      }
    }

    await submitRamp({
      uid,
      name,
      address,
      note,
      rating,
      lat: coords.lat,
      lng: coords.lng,
      photoUrl,
    });

    setModalOpen(false);
    setPendingCoords(null);
    await loadRamps();
    showToast("Ramp reported. Thank you for contributing.");
  }

  return (
    <div className="app-shell">
      <header>
        <svg className="seal" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18.5" stroke="#C44536" strokeWidth="1.6" />
          <circle cx="20" cy="20" r="14.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
          <circle cx="15" cy="14" r="2.6" fill="white" />
          <path
            d="M15 16.5 L15 23 Q15 28 20 28 Q25.5 28 25.5 22.5"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M15 19.5 L20.5 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="masthead-text">
          <div className="masthead-title">RampWatch PH</div>
          <div className="masthead-sub">Public Accessibility Registry</div>
        </div>
        <div className="header-right">
          <div className="count-display">
            <strong>{ramps.length}</strong>RAMPS RECORDED
          </div>
          <a href="/about" className="header-about-link">About the data</a>
          <button className="btn-report" onClick={handleOpenModalFromHeader}>
            Report a Ramp
          </button>
        </div>
      </header>

      <div className="mobile-toggle">
        <button
          className={`mobile-toggle-btn ${mobileView === "map" ? "on" : ""}`}
          onClick={() => setMobileView("map")}
        >
          Map
        </button>
        <button
          className={`mobile-toggle-btn ${mobileView === "list" ? "on" : ""}`}
          onClick={() => setMobileView("list")}
        >
          List ({ramps.length})
        </button>
      </div>

      <div className={`workspace view-${mobileView}`}>
        <Sidebar
          ramps={ramps}
          filter={filter}
          setFilter={setFilter}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setMobileView("map");
          }}
        />
        <div id="map">
          <OnboardingOverlay />
          <RampMap
            ramps={filter === 0 ? ramps : ramps.filter((r) => r.rating === filter)}
            onMapClick={handleMapClick}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isLoaded={mapsLoaded}
          />
        </div>
      </div>

      <ReportModal
        open={modalOpen}
        coords={pendingCoords}
        onClose={() => {
          setModalOpen(false);
          setPendingCoords(null);
        }}
        onSubmit={handleSubmit}
        mapsLoaded={mapsLoaded}
      />

      {toast && <div className="toast up">{toast}</div>}
    </div>
  );
}
