import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { kitParameterSchema } from "genshin-world";

// The constellations the overlay's multipliers name, each a multiplier's `constellation`, so each of their named hits is
// Read at that constellation's loop bounds as well as the base's
export const readOverlayConstellations = (overlay: KitOverlay): number[] => [
  ...new Set(
    Object.values(overlay).flatMap((entry) => {
      const parameter = kitParameterSchema.safeParse(entry.value).data;
      return typeof parameter === "object" && parameter.constellation !== undefined ? [parameter.constellation] : [];
    }),
  ),
];
