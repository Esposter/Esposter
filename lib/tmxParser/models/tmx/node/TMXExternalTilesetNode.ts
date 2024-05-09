import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXExternalTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXExternalTilesetShared";

export interface TMXExternalTilesetNode extends TMXNode<TMXExternalTilesetShared> {}
