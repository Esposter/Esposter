import type { ResourceLinkSource } from "@/models/resource/link/ResourceLinkSource";
import type { JsonSchema } from "@jsonforms/core";

import { RESOURCE_LINK_TYPE_KEYWORD } from "#shared/services/resource/link/constants";
import { ResourceLinkTypeSourceMap } from "@/services/resource/link/ResourceLinkTypeSourceMap";
import { resourceLinkTypeSchema } from "@esposter/db-schema";

// The source a schema's field is drawn from when it declares a link to a type that has one, and nothing otherwise.
// JSON Schema declares no key for a link's type, which zodToJsonSchema stamps under RESOURCE_LINK_TYPE_KEYWORD
export const getResourceLinkSource = (
  schema: JsonSchema & Partial<Record<typeof RESOURCE_LINK_TYPE_KEYWORD, unknown>>,
): ResourceLinkSource | undefined => {
  const resourceLinkType = resourceLinkTypeSchema.safeParse(schema[RESOURCE_LINK_TYPE_KEYWORD]).data;
  return resourceLinkType ? ResourceLinkTypeSourceMap[resourceLinkType] : undefined;
};
