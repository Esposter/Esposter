import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { checkBlockNodes } from "#src/services/checkBlockNodes";
import { getRootAcceptedTypes } from "#src/services/getRootAcceptedTypes";
import { z } from "zod";

// The document's shape with the root's props parsed by the root's own schema, so a parsed document's root props carry
// That schema's type, then its registry: the content the root accepts, every slot holding only the types it allows,
// Unique ids and the node count staying within the limit the consumer passes
export const createBlockDocumentSchema = <TRootProps extends Record<string, unknown>>(
  registry: BlockRegistry<BlockTypeDefinition, TRootProps>,
  maxNodes: number,
): z.ZodType<BlockDocument<TRootProps>> =>
  z
    .object({ content: z.array(blockNodeShapeSchema), root: z.object({ props: registry.root.propsSchema }) })
    .superRefine((document, context) => {
      const collection: BlockCollection = { count: 0, ids: new Set() };
      checkBlockNodes(context, registry, document.content, getRootAcceptedTypes(registry), ["content"], collection);
      if (collection.count > maxNodes)
        context.addIssue({ code: "custom", message: `holds more than ${maxNodes} nodes`, path: ["content"] });
    });
