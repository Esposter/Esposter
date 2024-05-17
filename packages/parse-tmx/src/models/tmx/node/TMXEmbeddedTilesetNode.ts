import type { TMXImageNode } from "@/src/models/tmx/node/TMXImageNode";
import type { TMXNode } from "@/src/models/tmx/node/TMXNode";
import type { TMXTileNode } from "@/src/models/tmx/node/TMXTileNode";
import type { TMXEmbeddedTilesetShared } from "@/src/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetNode extends TMXNode<TMXEmbeddedTilesetShared, TMXImageNode | TMXTileNode> {
  tile?: TMXTileNode[];
}
