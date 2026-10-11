import type { ResourceCapabilities } from "#shared/models/resource/ResourceCapabilities";
import type { JSONSchema } from "zod/v4/core";

export interface ReadResourceContentSchemaResult {
  capabilities: ResourceCapabilities;
  contentSchema: JSONSchema.BaseSchema;
}
