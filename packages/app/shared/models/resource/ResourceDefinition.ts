import type { ResourceCapabilities } from "#shared/models/resource/ResourceCapabilities";
import type { z } from "zod";

export interface ResourceDefinition<TContentSchema extends z.ZodType = z.ZodType> {
  capabilities: ResourceCapabilities;
  contentSchema: TContentSchema;
  icon: string;
  title: string;
}
