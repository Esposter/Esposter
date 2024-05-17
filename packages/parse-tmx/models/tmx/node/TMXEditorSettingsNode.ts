import type { TMXExportNode } from "parse-tmx/models/tmx/node/TMXExportNode";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";

export interface TMXEditorSettingsNode extends TMXNode<Record<string, never>, TMXExportNode> {}
