import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceType } from "@esposter/db-schema";
import type { z } from "zod";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

// The definition map read per key: each entry's content schema is typed by the key it sits under, so a generic type reads
// Its own schema and `ResourceContent<TType>` is that entry's output. A read of the map by a generic key alone types as the
// Union of every type's schema, which no single type's content would type against
const ResourceContentSchemaMap: {
  [TType in ResourceType]: {
    contentSchema: z.ZodType<ResourceContent<TType>, z.input<(typeof ResourceDefinitionMap)[TType]["contentSchema"]>>;
  };
} = ResourceDefinitionMap;

export const getResourceContentSchema = <TType extends ResourceType>(
  type: TType,
): (typeof ResourceContentSchemaMap)[TType]["contentSchema"] => ResourceContentSchemaMap[type].contentSchema;
