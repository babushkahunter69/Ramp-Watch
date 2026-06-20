"use client";

import { RATING_VERDICTS, RATING_LABELS } from "@/lib/constants";

export default function Legend() {
  return (
    <div className="legend">
      <div className="rail-eyebrow">How to read the map</div>
      <div className="legend-items">
        {[1, 2, 3, 4, 5].map((r) => (
          <div className="legend-row" key={r}>
            <span
              className="legend-dot"
              style={{ background: RATING_VERDICTS[r].color }}
            >
              {r}
            </span>
            <div className="legend-text">
              <strong>{RATING_LABELS[r]}</strong>
              <span>{RATING_VERDICTS[r].label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
