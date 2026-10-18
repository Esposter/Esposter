import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

// The characters an overlay borrows values from, each once, in the order its paths name them
export const getKitDonorCharacterIds = (overlay: KitOverlay): number[] => [
  ...new Set(
    Object.values(overlay).flatMap((entry) =>
      "donor" in entry && entry.donor !== undefined ? [entry.donor.characterId] : [],
    ),
  ),
];
