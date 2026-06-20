import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const RAMPS_COL = "ramps";
const SUBMISSION_COOLDOWN_MINUTES = 2;
const MAX_SUBMISSIONS_PER_DAY = 20;

// Fetch all ramps, newest first. For nationwide scale this should later
// be paginated or filtered by map bounds, but this is fine to start.
export async function fetchRamps() {
  const q = query(collection(db, RAMPS_COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Basic abuse guard: checks how many reports this uid made recently.
// Real protection (App Check, server-side throttling) should be added
// before public launch, this is a first line of defense only.
async function checkRateLimit(uid) {
  const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, RAMPS_COL),
    where("reporterId", "==", uid),
    where("createdAt", ">=", since)
  );
  const snap = await getDocs(q);

  if (snap.size >= MAX_SUBMISSIONS_PER_DAY) {
    throw new Error("Daily report limit reached. Please try again tomorrow.");
  }

  let mostRecentMs = 0;
  snap.forEach((d) => {
    const ts = d.data().createdAt;
    if (ts && ts.toMillis() > mostRecentMs) mostRecentMs = ts.toMillis();
  });

  if (mostRecentMs && Date.now() - mostRecentMs < SUBMISSION_COOLDOWN_MINUTES * 60 * 1000) {
    throw new Error("Please wait a moment before submitting another report.");
  }
}

export async function submitRamp({ uid, name, address, rating, note, lat, lng, photoUrl }) {
  if (!uid) throw new Error("Not signed in yet.");
  if (!name?.trim()) throw new Error("Establishment name is required.");
  if (!rating || rating < 1 || rating > 5) throw new Error("Rating must be 1 to 5.");
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new Error("Location is required.");
  }

  await checkRateLimit(uid);

  const docRef = await addDoc(collection(db, RAMPS_COL), {
    name: name.trim(),
    address: address?.trim() || "",
    rating,
    note: note?.trim() || "",
    lat,
    lng,
    photoUrl: photoUrl || "",
    reporterId: uid,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
