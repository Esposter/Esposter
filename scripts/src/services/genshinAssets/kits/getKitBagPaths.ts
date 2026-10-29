import type { KitOverlay } from "#src/models/shared/KitOverlay";
import type { KitRecord } from "genshin-world";

// The names a kit's module reads from its bags, as the paths they hold at: the published record's `frames` and
// `parameters` names, and the overlay's own keys, which are names the module reads too, so a rename reads at its new name
// Before it is published
export const getKitBagPaths = (
  { frames = {}, parameters = {} }: Pick<KitRecord, "frames" | "parameters">,
  overlay: KitOverlay,
): Set<string> =>
  new Set([
    ...Object.keys(frames).map((name) => `frames.${name}`),
    ...Object.keys(parameters).map((name) => `parameters.${name}`),
    ...Object.keys(overlay),
  ]);
