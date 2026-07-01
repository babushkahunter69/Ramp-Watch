"use client";

import { useEffect, useState } from "react";
import { adminSignIn, adminSignOut, onAdminAuthChange } from "@/lib/firebase";
import { fetchPendingRamps, setRampStatus } from "@/lib/ramps";

export default function AdminPage() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingOn, setActingOn] = useState(null);

  useEffect(() => onAdminAuthChange(setUser), []);

  useEffect(() => {
    if (user) loadPending();
  }, [user]);

  async function loadPending() {
    setLoading(true);
    try {
      setPending(await fetchPendingRamps());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    try {
      await adminSignIn(email, password);
    } catch (e) {
      setAuthError("Wrong email or password.");
    }
  }

  async function decide(id, status) {
    setActingOn(id);
    try {
      await setRampStatus(id, status);
      setPending((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Couldn't update that report. Try again.");
    } finally {
      setActingOn(null);
    }
  }

  if (user === undefined) {
    return <div style={styles.page}>Checking sign-in...</div>;
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <form onSubmit={handleLogin} style={styles.loginBox}>
          <h1 style={styles.h1}>RampWatch Admin</h1>
          <input
            style={styles.input}
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {authError && <div style={styles.error}>{authError}</div>}
          <button style={styles.btnPrimary} type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Pending reports ({pending.length})</h1>
        <button style={styles.btnGhost} onClick={() => adminSignOut()}>Sign out</button>
      </div>

      {loading && <div>Loading...</div>}
      {!loading && pending.length === 0 && <div>Nothing waiting on review.</div>}

      {pending.map((r) => (
        <div key={r.id} style={styles.card}>
          <div style={styles.cardTop}>
            <div>
              <div style={styles.name}>{r.name}</div>
              <div style={styles.meta}>{r.address || "No address"} &middot; Rating {r.rating}/5</div>
            </div>
            <div style={styles.actions}>
              <button
                style={styles.btnApprove}
                disabled={actingOn === r.id}
                onClick={() => decide(r.id, "approved")}
              >
                Approve
              </button>
              <button
                style={styles.btnReject}
                disabled={actingOn === r.id}
                onClick={() => decide(r.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
          {r.note && <div style={styles.note}>{r.note}</div>}
          {r.photoUrl && (
            <img src={r.photoUrl} alt="" style={styles.photo} />
          )}
          <div style={styles.meta}>
            {r.lat?.toFixed(5)}, {r.lng?.toFixed(5)}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  h1: { fontSize: 20, margin: 0 },
  loginBox: { display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "80px auto" },
  input: { padding: "10px 12px", fontSize: 14, border: "1px solid #ccc", borderRadius: 6 },
  btnPrimary: { padding: "10px 12px", fontSize: 14, background: "#1e2a44", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  btnGhost: { padding: "8px 12px", fontSize: 13, background: "none", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" },
  error: { color: "#b91c1c", fontSize: 13 },
  card: { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 14 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  name: { fontWeight: 600, fontSize: 16 },
  meta: { fontSize: 13, color: "#666", marginTop: 4 },
  note: { fontSize: 14, marginTop: 10, color: "#333" },
  photo: { maxWidth: "100%", borderRadius: 6, marginTop: 10 },
  actions: { display: "flex", gap: 8, flexShrink: 0 },
  btnApprove: { padding: "8px 14px", fontSize: 13, background: "#15803d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  btnReject: { padding: "8px 14px", fontSize: 13, background: "#b91c1c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
};
