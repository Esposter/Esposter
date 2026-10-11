import { TerrainSplatKind } from "#src/models/genshinAssets/world/TerrainSplatKind";
import { GroundLayer } from "genshin-engine";

// The ground layer each kind of the game's splat layers paints, Sumeru's desert as the sand it is
export const TerrainSplatKindGroundLayerMap = {
  [TerrainSplatKind.Desert]: GroundLayer.Sand,
  [TerrainSplatKind.Grass]: GroundLayer.Grass,
  [TerrainSplatKind.Sand]: GroundLayer.Sand,
  [TerrainSplatKind.Snow]: GroundLayer.Snow,
  [TerrainSplatKind.Soil]: GroundLayer.Earth,
  [TerrainSplatKind.Stone]: GroundLayer.Rock,
} as const satisfies Record<TerrainSplatKind, GroundLayer>;
