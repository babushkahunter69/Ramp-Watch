import Link from "next/link";

export const metadata = {
  title: "About the Data — RampWatch PH",
  description: "How RampWatch PH sources its accessibility data, including the initial seed entries.",
};

const SEEDED_ENTRIES = [
  {
    name: "EDSA Busway PhilAm Station",
    rating: 4,
    note: "Originally rated too steep (14° vs. the 4.8° legal maximum) and closed by the MMDA in 2024 after public criticism. A wheelchair lift was installed and inspected by the DOTr in May 2025.",
    sources: ["GMA News", "Rappler", "Philippine News Agency", "Philippine Information Agency"],
  },
  {
    name: "LRT-2 Recto Station",
    rating: 1,
    note: "Wheelchair ramp found blocked by a metal grill.",
    sources: ["Rappler, 2023 accessibility walkthrough of all 46 Metro Manila train stations"],
  },
  {
    name: "LRT-1 Doroteo Jose Station",
    rating: 1,
    note: "Ramp found obstructed, used as a motorcycle parking spot.",
    sources: ["Rappler, 2023 accessibility walkthrough"],
  },
  {
    name: "LRT-2 Katipunan Station (South Entrance)",
    rating: 2,
    note: "Ramp reported too steep for safe independent wheelchair use.",
    sources: ["Rappler, 2024 follow-up report"],
  },
  {
    name: "LRT-2 Antipolo Station",
    rating: 2,
    note: "Ramp reported too steep.",
    sources: ["Rappler, 2024 follow-up report"],
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-header">
        <Link href="/" className="about-back">← Back to map</Link>
        <div className="masthead-title" style={{ marginTop: 10 }}>About the Data</div>
      </header>

      <div className="about-body">
        <p>
          RampWatch PH is a crowdsourced registry. Most entries come directly from people
          who visited a location and rated what they found.
        </p>

        <p>
          <strong>A note on our initial entries:</strong> to avoid launching with an empty
          map, the first five locations were seeded using findings from published
          investigative journalism and government statements, not a personal visit by the
          RampWatch team. Each is sourced and dated below. If you&apos;ve visited any of these
          recently, please submit an updated report, conditions may have changed.
        </p>

        <table className="about-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Rating</th>
              <th>Finding</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {SEEDED_ENTRIES.map((entry) => (
              <tr key={entry.name}>
                <td className="about-table-name">{entry.name}</td>
                <td className="about-table-rating">{entry.rating}</td>
                <td>{entry.note}</td>
                <td className="about-table-source">
                  {entry.sources.join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          As the registry grows, seeded entries make up a smaller share of the data.
          The best way to correct an outdated entry is to submit a fresh report, every
          report after the first one carries the same weight.
        </p>

        <p className="about-callout">
          We&apos;re upfront about this because a registry that claims to be fully
          crowdsourced but quietly isn&apos;t would undermine the trust this project depends on.
          Accuracy and transparency matter more to us than looking established on day one.
        </p>
      </div>
    </div>
  );
}
