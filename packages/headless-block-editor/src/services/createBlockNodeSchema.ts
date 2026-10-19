import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { buildBlockNodeSchema } from "#src/services/buildBlockNodeSchema";
import type { z } from "zod";

// The schema of a node whose type is one of the accepted types, memoized per sorted type list within one build so a recursive slot reuses one schema
export const createBlockNodeSchema = <TNode extends BlockNode, TRootProps extends Record<string, unknown>>(
  registry: BlockRegistry<TNode, TRootProps>,
  acceptedTypes: string[],
): z.ZodType<TNode> => {
  const schemas = new Map<string, z.ZodType<TNode>>();
  const createNodeSchema = (types: string[]): z.ZodType<TNode> => {
    const sortedTypes = [...new Set(types)].toSorted();
    const key = JSON.stringify(sortedTypes);
    const cachedSchema = schemas.get(key);
    if (cachedSchema) return cachedSchema;

    const schema = buildBlockNodeSchema(registry, sortedTypes, createNodeSchema);
    schemas.set(key, schema);
    return schema;
  };
  return createNodeSchema(acceptedTypes);
};
