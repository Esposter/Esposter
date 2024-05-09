import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXExportShared } from "@/lib/tmxParser/models/tmx/shared/TMXExportShared";

export interface TMXExportNode extends TMXNode<TMXExportShared> {}
