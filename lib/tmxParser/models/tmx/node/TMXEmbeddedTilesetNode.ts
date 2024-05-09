import type { TMXImageNode } from "@/lib/tmxParser/models/tmx/node/TMXImageNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXTileNode } from "@/lib/tmxParser/models/tmx/node/TMXTileNode";
import type { TMXEmbeddedTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetNode extends TMXNode<TMXEmbeddedTilesetShared, TMXImageNode | TMXTileNode> {
  tile?: TMXTileNode[];
}
