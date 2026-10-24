import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";

import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";

export const webpageKind: WebpageKind = {
  children: webpageNodeChildren,
  documentSchema: webpageDocumentSchema,
  nodeSchema: webpageNodeSchema,
  registry: webpageRegistry,
};
