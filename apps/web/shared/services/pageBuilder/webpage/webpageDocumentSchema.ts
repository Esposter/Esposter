import type { WebpageDocument } from "#shared/models/pageBuilder/webpage/WebpageDocument";

import { webpageRootPropsSchema } from "#shared/models/pageBuilder/webpage/WebpageRootProps";
import { createPageDocumentSchema } from "#shared/services/pageBuilder/createPageDocumentSchema";
import { WEBPAGE_CONTENT_NODE_TYPES } from "#shared/services/pageBuilder/webpage/constants";
import { webpageNodeSchema } from "#shared/services/pageBuilder/webpage/webpageNodeSchema";
import { WebpageNodeTypeMap } from "#shared/services/pageBuilder/webpage/WebpageNodeTypeMap";
import { z } from "zod";

export const webpageDocumentSchema = createPageDocumentSchema(
  webpageRootPropsSchema,
  webpageNodeSchema,
  WebpageNodeTypeMap,
  { allow: WEBPAGE_CONTENT_NODE_TYPES },
) satisfies z.ZodType<WebpageDocument>;
