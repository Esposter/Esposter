import type { TMXEditorSettingsNode } from "@/models/tmx/node/TMXEditorSettingsNode";
import type { TMXGroupLayerNode } from "@/models/tmx/node/TMXGroupLayerNode";
import type { TMXNode } from "@/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "@/models/tmx/node/TMXPropertiesNode";
import type { TMXTilesetNode } from "@/models/tmx/node/TMXTilesetNode";
import type { TMXMapShared } from "@/models/tmx/shared/TMXMapShared";

export interface TMXMapNode extends TMXNode<
  TMXMapShared,
  TMXEditorSettingsNode | TMXGroupLayerNode | TMXPropertiesNode | TMXTilesetNode
> {}
