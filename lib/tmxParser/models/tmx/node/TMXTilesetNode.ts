import type { TMXEmbeddedTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXExternalTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXExternalTilesetNode";

export type TMXTilesetNode = TMXEmbeddedTilesetNode | TMXExternalTilesetNode;
