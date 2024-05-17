import type { TMXEditorSettingsNode } from "@/src/models/tmx/node/TMXEditorSettingsNode";
import type { TMXGroupLayerNode } from "@/src/models/tmx/node/TMXGroupLayerNode";
import type { TMXNode } from "@/src/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "@/src/models/tmx/node/TMXPropertiesNode";
import type { TMXTilesetNode } from "@/src/models/tmx/node/TMXTilesetNode";
import type { TMXMapShared } from "@/src/models/tmx/shared/TMXMapShared";

export interface TMXMapNode
  extends TMXNode<TMXMapShared, TMXEditorSettingsNode | TMXTilesetNode | TMXGroupLayerNode | TMXPropertiesNode> {}
