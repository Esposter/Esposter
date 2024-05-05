import type { TMXExportNode } from "@/lib/tmxParser/models/tmx/node/TMXExportNode";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";

export interface TMXEditorSettingsNode extends TMXNode<Record<string, never>, TMXExportNode> {}
