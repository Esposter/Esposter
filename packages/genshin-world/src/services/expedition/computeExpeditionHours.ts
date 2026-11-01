import type { ExpeditionDuration } from "#src/models/expedition/ExpeditionDuration";

// The length a send takes: the length picked while the place offers it, else the place's first, so a place picked
// Before any length is sent for its first, as the game's picker opens on it. Zero where the place offers none
export const computeExpeditionHours = (durations: readonly ExpeditionDuration[], pickedHours: number): number =>
  durations.some(({ hours }) => hours === pickedHours) ? pickedHours : (durations.at(0)?.hours ?? 0);
