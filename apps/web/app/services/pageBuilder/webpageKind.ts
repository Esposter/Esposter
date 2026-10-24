import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";

import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";

export const webpageKind: PageBuilderKind = {
  children: webpageNodeChildren,
  documentSchema: webpageDocumentSchema,
  registry: webpageRegistry,
};
