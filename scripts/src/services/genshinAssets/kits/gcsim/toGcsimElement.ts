import { GCSIM_ELEMENTLESS_ELEMENTS } from "#src/services/genshinAssets/kits/constants";
import { GcsimElementMap } from "#src/services/genshinAssets/kits/gcsim/GcsimElementMap";

// The element a gcsim element name gives a hit, undefined where the hit has none. A name the map does not hold is kept as
// Gcsim's literal, which the kit's schema refuses
export const toGcsimElement = (identifier: string): string | undefined =>
  GCSIM_ELEMENTLESS_ELEMENTS.has(identifier) ? undefined : (GcsimElementMap[identifier] ?? identifier);
