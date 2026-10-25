import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";

// An overlay entry choosing a source
export type KitOverlayChoice = Extract<KitOverlayEntry, { source: unknown }>;
