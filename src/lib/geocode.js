// Converts a free-text address into lat/lng using Google's Geocoding API.
// Returns null if nothing was found instead of throwing, callers decide
// how to handle a miss (e.g. fall back to the clicked map point).
export async function geocodeAddress(address) {
  if (!address?.trim()) return null;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const params = new URLSearchParams({
    address: `${address}, Philippines`,
    key,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) return null;

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng, formattedAddress: data.results[0].formatted_address };
}
