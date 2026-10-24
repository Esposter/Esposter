import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";

import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";

export const webpageKind: PageBuilderKind = { documentSchema: webpageDocumentSchema };
