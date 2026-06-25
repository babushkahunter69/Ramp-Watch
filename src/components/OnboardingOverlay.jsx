"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rampwatch_onboarded";

export default function OnboardingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        // Small delay so the map is visible first, this is a hint,
        // not a gate the person has to clear before seeing the product.
        const t = setTimeout(() => setShow(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable (private browsing etc), just skip onboarding
    }
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore, worst case it shows again next visit
    }
  }

  if (!show) return null;

  return (
    <div className="onboarding-tip">
      <button className="onboarding-tip-close" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
      <div className="onboarding-tip-title">How RampWatch works</div>
      <p className="onboarding-tip-text">
        Pins show reported ramps, colored by rating. Click one for details, or click anywhere on the map to report a new one.
      </p>
      <div className="onboarding-tip-scale">
        <span className="dot" style={{ background: "#C44536" }}></span>
        <span>Unusable</span>
        <span className="onboarding-scale-arrow">→</span>
        <span className="dot" style={{ background: "#3A7D5C" }}></span>
        <span>Fully accessible</span>
      </div>
      <button className="onboarding-tip-dismiss" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
