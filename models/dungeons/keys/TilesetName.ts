import { type TilesetKey } from "@/models/dungeons/keys/TilesetKey";

// This cannot conflict with tileset keys as they are used as ids
// by phaser in the same global namespace
export const TilesetName = {
  "Cloud City": "Cloud City",
} satisfies Record<string, string> & {
  [P in TilesetKey]?: never;
};
