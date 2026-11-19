import type { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import type { SilhouetteSize } from "genshin-engine";

import { WildlifeShape } from "#src/models/wildlife/WildlifeShape";

// An animal of a kind is drawn as its silhouette when the kind has a fitted one, and as the capsule when it has none
export const getWildlifeShape = (
  kind: WildlifeKind,
  silhouetteSizes: Partial<Record<WildlifeKind, SilhouetteSize>>,
): WildlifeShape => (silhouetteSizes[kind] === undefined ? WildlifeShape.Capsule : WildlifeShape.Silhouette);
