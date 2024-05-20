import type { TMXExportNode } from "@/models/tmx/node/TMXExportNode";
import type { TMXNode } from "@/models/tmx/node/TMXNode";

export interface TMXEditorSettingsNode extends TMXNode<Record<string, never>, TMXExportNode> {}
