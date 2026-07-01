"use client";

import { useState } from "react";
import { RATING_LABELS } from "@/lib/constants";
import PlaceAutocompleteInput from "@/components/PlaceAutocompleteInput";
import { validateName, validateNote } from "@/lib/validation";

export default function ReportModal({ open, coords, onClose, onSubmit, mapsLoaded }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placeCoords, setPlaceCoords] = useState(null);
  const [addressLocked, setAddressLocked] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  if (!open) return null;

  function reset() {
    setName("");
    setAddress("");
    setNote("");
    setRating(0);
    setError("");
    setPlaceCoords(null);
    setAddressLocked(false);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    const noteError = validateNote(note);
    if (noteError) {
      setError(noteError);
      return;
    }
    if (!rating) {
      setError("Select a rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ name, address, note, rating, placeCoords, photoFile });
      reset();
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Report a Ramp</div>
            {coords && (
              <div className="modal-coord">
                COORDS {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </div>
            )}
          </div>
          <button className="modal-x" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label className="flabel">Establishment name</label>
            {mapsLoaded ? (
              <PlaceAutocompleteInput
                value={name}
                onChange={setName}
                placeholder="e.g. SM Mall of Asia, Makati City Hall"
                onPlaceSelected={(place) => {
                  setName(place.name);
                  setAddress(place.address);
                  setPlaceCoords({ lat: place.lat, lng: place.lng });
                  setAddressLocked(true);
                }}
              />
            ) : (
              <input
                className="finput"
                type="text"
                placeholder="e.g. SM Mall of Asia, Makati City Hall"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </div>

          <div className="field">
            <label className="flabel">
              Address {addressLocked && <span className="flabel-hint">(auto-filled, click to edit)</span>}
            </label>
            <input
              className="finput"
              type="text"
              placeholder="Street, City"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressLocked(false);
              }}
            />
          </div>

          <div className="field">
            <label className="flabel">Accessibility rating</label>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  className={`rbtn ${rating === r ? "pick" : ""}`}
                  data-r={r}
                  onClick={() => setRating(r)}
                  type="button"
                >
                  <span className="rbtn-num">{r}</span>
                  <span className="rbtn-lbl">{RATING_LABELS[r]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="flabel">Notes (optional)</label>
            <textarea
              className="finput"
              rows={2}
              placeholder="Describe the condition of the ramp..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="flabel">
              Photo <span className="flabel-hint">(optional, but recommended)</span>
            </label>
            {!photoPreview ? (
              <label className="photo-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="photo-input-hidden"
                />
                <span className="photo-dropzone-icon">📷</span>
                <span className="photo-dropzone-text">
                  Tap to add a photo of the ramp
                </span>
                <span className="photo-dropzone-sub">
                  Reports with photos are easier to act on
                </span>
              </label>
            ) : (
              <div className="photo-preview-wrap">
                <img src={photoPreview} alt="Ramp preview" className="photo-preview" />
                <button type="button" className="photo-remove" onClick={removePhoto}>
                  Remove photo
                </button>
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-foot">
          <button className="btn-cancel" onClick={handleClose} type="button">
            Cancel
          </button>
          <button className="btn-save" onClick={handleSubmit} disabled={submitting} type="button">
            {submitting ? "Uploading…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
