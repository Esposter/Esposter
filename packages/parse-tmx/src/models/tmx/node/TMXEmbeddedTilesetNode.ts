import type { TMXImageNode } from "@/models/tmx/node/TMXImageNode";
import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXTileNode } from "@/models/tmx/node/TMXTileNode";
import type { TMXEmbeddedTilesetShared } from "@/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetNode extends TMXNode<TMXEmbeddedTilesetShared, TMXImageNode | TMXTileNode> {
  tile?: TMXTileNode[];
}
