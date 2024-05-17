import type { TMXImageNode } from "parse-tmx/models/tmx/node/TMXImageNode";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXTileNode } from "parse-tmx/models/tmx/node/TMXTileNode";
import type { TMXEmbeddedTilesetShared } from "parse-tmx/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetNode extends TMXNode<TMXEmbeddedTilesetShared, TMXImageNode | TMXTileNode> {
  tile?: TMXTileNode[];
}
