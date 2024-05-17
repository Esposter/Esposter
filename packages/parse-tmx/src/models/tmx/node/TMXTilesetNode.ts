import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXExternalTilesetNode } from "@/models/tmx/node/TMXExternalTilesetNode";

export type TMXTilesetNode = TMXEmbeddedTilesetNode | TMXExternalTilesetNode;
