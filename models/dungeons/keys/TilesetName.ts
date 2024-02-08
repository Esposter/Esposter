import { type TilesetKey } from "@/models/dungeons/keys/TilesetKey";

// This cannot conflict with tileset keys because in phaser
// they are used as ids in the same namespace
export const TilesetName = {} satisfies Record<string, string> & {
  [P in TilesetKey]?: never;
};
export type TilesetName = typeof TilesetName;
