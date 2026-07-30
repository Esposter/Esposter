import type { ToData } from "@esposter/shared";

import { MAX_BLUEPRINT_KEY_LENGTH } from "#shared/services/resource/blueprint/constants";
import { ResourceType, resourceTypeSchema, selectResourceSchema } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

// One resource-to-be: `key` is the local alias (unique within the manifest), `name` becomes the created
// Resource's name, `content` is the entry type's own content shape — left unknown here and validated
// Against `ResourceDefinitionMap[type].contentSchema` at deploy, after token substitution.
// Absent content is a resource whose content blob was never written, and deploys back to that same state
export interface BlueprintEntry {
  content?: unknown;
  key: string;
  name: string;
  type: ResourceType;
}

export const blueprintEntrySchema = z.object({
  content: z.unknown().optional(),
  key: z.string().transform(normalizeString).pipe(z.string().min(1).max(MAX_BLUEPRINT_KEY_LENGTH)),
  name: selectResourceSchema.shape.name,
  type: resourceTypeSchema,
}) satisfies z.ZodType<ToData<BlueprintEntry>>;
