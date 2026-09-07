import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";
import type { BlueprintParameter } from "#shared/models/resource/blueprint/BlueprintParameter";
import type { ToData } from "@esposter/shared";

import { blueprintEntrySchema } from "#shared/models/resource/blueprint/BlueprintEntry";
import { blueprintParameterSchema } from "#shared/models/resource/blueprint/BlueprintParameter";
import { MAX_BLUEPRINT_ENTRIES, MAX_BLUEPRINT_PARAMETERS } from "#shared/services/resource/blueprint/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The manifest: a list of resource entries (each with a local alias, a name, and full content) plus a
// List of deploy-time parameters. Keys are unique within each list so a token resolves to exactly one target
export interface BlueprintResource {
  entries: BlueprintEntry[];
  parameters: BlueprintParameter[];
}

export const blueprintResourceSchema = z.object({
  entries: createUniqueArraySchema(blueprintEntrySchema, "key").max(MAX_BLUEPRINT_ENTRIES).default([]),
  parameters: createUniqueArraySchema(blueprintParameterSchema, "key").max(MAX_BLUEPRINT_PARAMETERS).default([]),
}) satisfies z.ZodType<ToData<BlueprintResource>>;
