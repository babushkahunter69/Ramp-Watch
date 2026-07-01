import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { validateName, validateNote } from "./validation";

const RAMPS_COL = "ramps";
const SUBMISSION_COOLDOWN_MINUTES = 2;
const MAX_SUBMISSIONS_PER_DAY = 20;

// Fetch approved ramps, newest first, for the public map/list.
export async function fetchRamps() {
  const q = query(
    collection(db, RAMPS_COL),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// For the admin queue: everything waiting on a decision.
export async function fetchPendingRamps() {
  const q = query(
    collection(db, RAMPS_COL),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setRampStatus(rampId, status) {
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status.");
  }
  await updateDoc(doc(db, RAMPS_COL, rampId), { status });
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
  const nameError = validateName(name);
  if (nameError) throw new Error(nameError);
  const noteError = validateNote(note);
  if (noteError) throw new Error(noteError);
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
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
