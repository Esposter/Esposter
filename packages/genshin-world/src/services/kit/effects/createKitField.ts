import type { KitField } from "#src/models/kit/KitField";
import type { GroundPoint } from "genshin-engine";
import type { Except } from "type-fest";

import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";

// A field a character casts at a point, ticking on its schedule for its seconds, over the whole world unless it is given
// A radius. It copies the point, so its centre is its own and a following field moves only itself
export const createKitField = (
  characterId: number,
  { x, z }: GroundPoint,
  {
    radius = UNBOUNDED_FIELD_RADIUS,
    ...fields
  }: Except<KitField, "centre" | "characterId" | "kind" | "radius" | "tickIndex"> & Partial<Pick<KitField, "radius">>,
): KitField => ({ centre: { x, z }, characterId, kind: "field", radius, tickIndex: 0, ...fields });
