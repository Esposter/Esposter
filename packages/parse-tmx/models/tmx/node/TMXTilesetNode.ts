import type { TMXEmbeddedTilesetNode } from "parse-tmx/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXExternalTilesetNode } from "parse-tmx/models/tmx/node/TMXExternalTilesetNode";

export type TMXTilesetNode = TMXEmbeddedTilesetNode | TMXExternalTilesetNode;
