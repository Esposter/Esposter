import type { TMXDataNode } from "@/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";

export const isTMXEmbeddedTilesetNode = (node: TMXEmbeddedTilesetNode | TMXDataNode): node is TMXEmbeddedTilesetNode =>
  "tile" in node;
