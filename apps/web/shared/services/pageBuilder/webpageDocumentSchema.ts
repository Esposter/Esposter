import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageRootProps } from "#shared/models/pageBuilder/WebpageRootProps";
import type { z } from "zod";

import { webpageRootPropsSchema } from "#shared/models/pageBuilder/WebpageRootProps";
import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { createBlockDocumentSchema } from "headless-block-editor";

// A webpage document, refused on a duplicate id, a node a slot does not allow, props its type refuses, or too many nodes
export const webpageDocumentSchema = createBlockDocumentSchema<WebpageNode, WebpageRootProps>(
  webpageRegistry,
  webpageNodeSchema,
  webpageRootPropsSchema,
  webpageNodeChildren,
  MAX_WEBPAGE_NODES,
) satisfies z.ZodType<WebpageDocument>;
