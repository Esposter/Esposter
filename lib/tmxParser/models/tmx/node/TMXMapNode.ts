import type { TMXEditorSettingsNode } from "@/lib/tmxParser/models/tmx/node/TMXEditorSettingsNode";
import type { TMXLayerGroupNode } from "@/lib/tmxParser/models/tmx/node/TMXLayerGroupNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "@/lib/tmxParser/models/tmx/node/TMXPropertiesNode";
import type { TMXTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXTilesetNode";
import type { TMXMapShared } from "@/lib/tmxParser/models/tmx/shared/TMXMapShared";

export interface TMXMapNode
  extends TMXNode<TMXMapShared, TMXEditorSettingsNode | TMXTilesetNode | TMXLayerGroupNode | TMXPropertiesNode> {}
