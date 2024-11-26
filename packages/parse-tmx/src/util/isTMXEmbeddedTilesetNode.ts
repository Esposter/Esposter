import type { TMXDataNode } from "@/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";

export const isTMXEmbeddedTilesetNode = (node: TMXDataNode | TMXEmbeddedTilesetNode): node is TMXEmbeddedTilesetNode =>
  "tile" in node;
