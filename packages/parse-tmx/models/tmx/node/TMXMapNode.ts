import type { TMXEditorSettingsNode } from "parse-tmx/models/tmx/node/TMXEditorSettingsNode";
import type { TMXGroupLayerNode } from "parse-tmx/models/tmx/node/TMXGroupLayerNode";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";
import type { TMXPropertiesNode } from "parse-tmx/models/tmx/node/TMXPropertiesNode";
import type { TMXTilesetNode } from "parse-tmx/models/tmx/node/TMXTilesetNode";
import type { TMXMapShared } from "parse-tmx/models/tmx/shared/TMXMapShared";

export interface TMXMapNode
  extends TMXNode<TMXMapShared, TMXEditorSettingsNode | TMXTilesetNode | TMXGroupLayerNode | TMXPropertiesNode> {}
