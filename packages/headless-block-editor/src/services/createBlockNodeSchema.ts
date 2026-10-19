import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import type { z } from "zod";

import { buildBlockNodeSchema } from "#src/services/buildBlockNodeSchema";

const blockNodeSchemaCaches = new WeakMap<BlockRegistry, Map<string, z.ZodType<BlockNode>>>();

// The schema of a node whose type is one of the accepted types, cached per registry and sorted type list so a recursive slot reuses one schema
export const createBlockNodeSchema = (registry: BlockRegistry, acceptedTypes: string[]): z.ZodType<BlockNode> => {
  const cache = blockNodeSchemaCaches.get(registry) ?? new Map<string, z.ZodType<BlockNode>>();
  blockNodeSchemaCaches.set(registry, cache);

  const sortedTypes = [...new Set(acceptedTypes)].toSorted();
  const key = JSON.stringify(sortedTypes);
  const cachedSchema = cache.get(key);
  if (cachedSchema) return cachedSchema;

  const schema = buildBlockNodeSchema(registry, sortedTypes, createBlockNodeSchema);
  cache.set(key, schema);
  return schema;
};
