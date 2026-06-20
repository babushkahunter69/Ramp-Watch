"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rampwatch_onboarded";

export default function OnboardingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setShow(true);
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
    <div className="onboarding-overlay" onClick={dismiss}>
      <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-head">
          <div className="onboarding-title">Welcome to RampWatch PH</div>
          <button className="modal-x" onClick={dismiss}>×</button>
        </div>

        <div className="onboarding-body">
          <p className="onboarding-lede">
            A public registry of wheelchair ramp accessibility across the Philippines, built by people who actually use these ramps.
          </p>

          <div className="onboarding-step">
            <span className="onboarding-step-num">1</span>
            <div>
              <strong>Browse the map</strong>
              <p>Each pin is a reported ramp. The number and color show its accessibility rating.</p>
            </div>
          </div>

          <div className="onboarding-step">
            <span className="onboarding-step-num">2</span>
            <div>
              <strong>Click a pin or list item</strong>
              <p>See details, notes from the reporter, and when it was assessed.</p>
            </div>
          </div>

          <div className="onboarding-step">
            <span className="onboarding-step-num">3</span>
            <div>
              <strong>Report a ramp</strong>
              <p>Click anywhere on the map, or use the button up top, type the establishment name, and rate what you see.</p>
            </div>
          </div>

          <div className="onboarding-scale">
            <span className="dot" style={{ background: "#C44536" }}></span>
            <span>1 Unusable</span>
            <span className="onboarding-scale-arrow">→</span>
            <span className="dot" style={{ background: "#3A7D5C" }}></span>
            <span>5 Fully accessible</span>
          </div>
        </div>

        <div className="onboarding-foot">
          <button className="btn-save" onClick={dismiss}>Got it, let's go</button>
        </div>
      </div>
    </div>
  );
}
