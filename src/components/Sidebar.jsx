"use client";

import { useState } from "react";
import { RATING_COLORS } from "@/lib/constants";
import Legend from "@/components/Legend";

export default function Sidebar({ ramps, filter, setFilter, selectedId, onSelect }) {
  const [legendOpen, setLegendOpen] = useState(false);
  const filtered = filter === 0 ? ramps : ramps.filter((r) => r.rating === filter);
  const sorted = [...filtered].sort((a, b) => a.rating - b.rating);

  return (
    <div className="rail">
      <div className="rail-header">
        <div className="rail-eyebrow">Registry overview</div>
        <div className="rail-stat-row">
          <span className="rail-stat-num">{ramps.length}</span>
          <span className="rail-stat-label">locations assessed</span>
        </div>
        <div className="filter-row">
          <button className={`chip ${filter === 0 ? "on" : ""}`} onClick={() => setFilter(0)}>
            All
          </button>
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              className={`chip ${filter === r ? "on" : ""}`}
              onClick={() => setFilter(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="legend-toggle" onClick={() => setLegendOpen((v) => !v)}>
          {legendOpen ? "Hide rating guide ▲" : "What do the ratings mean? ▼"}
        </button>
        {legendOpen && <Legend />}
      </div>

      <div className="ramp-list">
        {sorted.length === 0 && <div className="empty">NO RAMPS WITH THIS RATING</div>}
        {sorted.map((r) => (
          <div
            key={r.id}
            className={`ramp-row ${selectedId === r.id ? "sel" : ""}`}
            onClick={() => onSelect(r.id)}
          >
            <div className="ramp-score" style={{ color: RATING_COLORS[r.rating] }}>
              {r.rating}
            </div>
            <div className="ramp-body">
              <div className="ramp-name">
                {r.name}
                {r.photoUrl && <span className="ramp-photo-badge" title="Has photo">📷</span>}
              </div>
              <div className="ramp-addr">{r.address || "Philippines"}</div>
              {r.note && <div className="ramp-note-preview">{r.note}</div>}
              <div className="ramp-foot">
                {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                }) : "Just now"}
                {r.reporterId === "seed-data" && (
                  <a href="/about" className="sourced-tag" onClick={(e) => e.stopPropagation()}>
                    Sourced from public reporting
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
