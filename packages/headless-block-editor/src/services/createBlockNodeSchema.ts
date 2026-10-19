import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { z } from "zod";

import { buildBlockNodeSchema } from "#src/services/buildBlockNodeSchema";

// A registry is read-only once built, so its schemas are kept per registry across parses, keyed by the sorted accepted types
const blockNodeSchemaCaches = new WeakMap<BlockRegistry, Map<string, z.ZodType<BlockNode>>>();

// The schema of a node whose type is one of the accepted types, cached per registry and sorted type list so a recursive slot reuses one schema
export const createBlockNodeSchema = <TNode extends BlockNode>(
  registry: BlockRegistry<TNode>,
  acceptedTypes: string[],
): z.ZodType<TNode> => {
  const schemas = blockNodeSchemaCaches.get(registry) ?? new Map<string, z.ZodType<BlockNode>>();
  blockNodeSchemaCaches.set(registry, schemas);
  const createNodeSchema = (types: string[]): z.ZodType<TNode> => {
    const sortedTypes = [...new Set(types)].toSorted();
    const key = JSON.stringify(sortedTypes);
    const cachedSchema = schemas.get(key);
    // The cache holds the schemas of every node type the registry builds, so the entry read back is narrowed to the one type this registry's nodes are
    if (cachedSchema) return cachedSchema as z.ZodType<TNode>;

    const schema = buildBlockNodeSchema(registry, sortedTypes, createNodeSchema);
    schemas.set(key, schema);
    return schema;
  };
  return createNodeSchema(acceptedTypes);
};
