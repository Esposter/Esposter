import type { TMXEmbeddedTilesetNode } from "@/src/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXExternalTilesetNode } from "@/src/models/tmx/node/TMXExternalTilesetNode";

export type TMXTilesetNode = TMXEmbeddedTilesetNode | TMXExternalTilesetNode;
