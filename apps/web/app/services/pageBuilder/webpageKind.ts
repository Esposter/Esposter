import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";

import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";

export const webpageKind: WebpageKind = {
  children: webpageNodeChildren,
  documentSchema: webpageDocumentSchema,
  registry: webpageRegistry,
};
