import type { TMXEmbeddedTilesetShared } from "@/models/tmx/shared/TMXEmbeddedTilesetShared";

import { describe } from "vitest";

export const createEmbeddedTilesetShared = (): TMXEmbeddedTilesetShared => ({
  columns: 0,
  firstgid: 0,
  imageheight: 0,
  imagewidth: 0,
  margin: 0,
  name: "",
  spacing: 0,
  tilecount: 0,
  tileheight: 0,
  tilewidth: 0,
});

describe.todo(createEmbeddedTilesetShared);
