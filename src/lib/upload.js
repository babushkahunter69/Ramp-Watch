import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const MAX_SIZE_MB = 1;
const MAX_WIDTH_OR_HEIGHT = 1600;

// Compresses an image in the browser before upload, this keeps storage
// costs and load times reasonable at nationwide scale. Returns the
// public download URL to store on the ramp document.
export async function uploadRampPhoto(file, uid) {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    useWebWorker: true,
  });

  const filename = `${uid}_${Date.now()}.jpg`;
  const storageRef = ref(storage, `ramp-photos/${filename}`);

  await uploadBytes(storageRef, compressed, {
    contentType: "image/jpeg",
  });

  return getDownloadURL(storageRef);
}
