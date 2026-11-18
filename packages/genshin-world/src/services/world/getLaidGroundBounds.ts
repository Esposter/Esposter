import type { LaidGround } from "#src/models/world/LaidGround";
import type { TerrainBounds } from "genshin-engine";

import { GROUND_BLEND_WIDTH } from "#src/services/world/constants";
import { getTerrainPieceBounds } from "#src/services/world/getTerrainPieceBounds";
import { getTerrainOverlayBounds } from "genshin-engine";

// The rectangle past which a laid ground changes no height: a piece's domain grown by the blend band, and a plateau's
// Reach as the overlay bounds take it
export const getLaidGroundBounds = ({ domain, ground }: LaidGround): TerrainBounds =>
  domain ? getTerrainPieceBounds(domain, GROUND_BLEND_WIDTH) : getTerrainOverlayBounds(ground);
