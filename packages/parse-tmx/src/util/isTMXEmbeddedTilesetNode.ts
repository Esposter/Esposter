import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "#src/models/tmx/node/TMXEmbeddedTilesetNode";

export const isTMXEmbeddedTilesetNode = (node: TMXDataNode | TMXEmbeddedTilesetNode): node is TMXEmbeddedTilesetNode =>
  "tile" in node;
