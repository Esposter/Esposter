import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";

export const LayerNameTilesetKeysMap = {
  [LayerName.Ground]: [TilesetKey.BasicPlains, TilesetKey.Grass],
  [LayerName.Building]: [TilesetKey.House],
  [LayerName.Water]: [TilesetKey.BeachAndCaves],
  [LayerName.Decoration]: [TilesetKey.BasicPlains, TilesetKey.Bushes],
  [LayerName.Sign]: [TilesetKey.BasicPlains],
  [LayerName.TreeBottom]: [TilesetKey.BasicPlains],
  [LayerName.TreeTop]: [TilesetKey.BasicPlains],
  [LayerName.Fence]: [TilesetKey.BasicPlains],
  [LayerName.Boulder]: [TilesetKey.BasicPlains],
  [LayerName.Foreground]: [TilesetKey.BasicPlains, TilesetKey.House],
  [LayerName.Encounter]: [TilesetKey.Encounter],
  [LayerName.Collision]: [TilesetKey.Collision],
} as const satisfies Record<LayerName, TilesetKey[]>;
