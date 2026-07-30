import type { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import type { ResourceType } from "@esposter/db-schema";
import type { z } from "zod";

// The content shape one resource type stores — the inferred output of that type's own contentSchema, which
// Is the single declaration every reader, writer and after-save hook of that type's content is typed from
export type ResourceContent<TType extends ResourceType> = z.infer<
  (typeof ResourceDefinitionMap)[TType]["contentSchema"]
>;
