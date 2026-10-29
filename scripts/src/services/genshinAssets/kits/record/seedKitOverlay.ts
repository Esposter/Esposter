import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { expandKitOverlay } from "genshin-world";

// The overlay a seeding write saves: the committed overlay in its own form, its range keys kept, with each seeded entry the
// Committed overlay does not cover added under its own path. A seeded entry is read per hit, so its index is set to
// Undefined here, which JSON leaves out, and an index is never written
export const seedKitOverlay = (committedOverlay: KitOverlay, seededOverlay: KitOverlay): KitOverlay => {
  const coveredPaths = new Set(Object.keys(expandKitOverlay(committedOverlay)));
  const savedOverlay: KitOverlay = { ...committedOverlay };
  for (const [path, entry] of Object.entries(seededOverlay))
    if (!coveredPaths.has(path)) savedOverlay[path] = "index" in entry ? { ...entry, index: undefined } : entry;
  return savedOverlay;
};
